-- =====================================================
-- COMPLETE RLS POLICY FIX + UPDATED RPC FUNCTIONS
-- Run this ENTIRE script in your Supabase SQL Editor
-- It drops ALL existing policies and recreates them
-- =====================================================

-- Step 0: Update the process_cash_in RPC to support target account selection
CREATE OR REPLACE FUNCTION public.process_cash_in(
  p_bank_id UUID,
  p_amount NUMERIC,
  p_target_type TEXT,
  p_target_id UUID DEFAULT NULL,
  p_source TEXT DEFAULT NULL,
  p_reference TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_txn_id UUID;
BEGIN
  INSERT INTO public.transactions (bank_id, type, amount, source, mother_account_id, reference, notes, performed_by)
  VALUES (
    p_bank_id, 'cash_in', p_amount, p_source,
    CASE WHEN p_target_type = 'mother_account' THEN p_target_id ELSE NULL END,
    p_reference, p_notes, auth.uid()
  )
  RETURNING id INTO v_txn_id;

  -- Credit the chosen target account
  IF p_target_type = 'hand_cash' THEN
    UPDATE public.hand_cash_accounts SET balance = balance + p_amount WHERE bank_id = p_bank_id;
  ELSIF p_target_type = 'mother_account' AND p_target_id IS NOT NULL THEN
    UPDATE public.mother_accounts SET balance = balance + p_amount WHERE id = p_target_id;
  ELSIF p_target_type = 'profit_account' AND p_target_id IS NOT NULL THEN
    UPDATE public.profit_accounts SET balance = balance + p_amount WHERE id = p_target_id;
  END IF;

  RETURN v_txn_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 0b: Update process_deposit — only hand cash increases (mother account is reference only)
CREATE OR REPLACE FUNCTION public.process_deposit(
  p_bank_id UUID,
  p_customer_name TEXT,
  p_customer_account TEXT,
  p_amount NUMERIC,
  p_commission NUMERIC,
  p_mother_account_id UUID,
  p_reference TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_txn_id UUID;
  v_profit_account_id UUID;
BEGIN
  INSERT INTO public.transactions (bank_id, type, amount, commission, customer_name, customer_account, mother_account_id, reference, notes, performed_by)
  VALUES (p_bank_id, 'deposit', p_amount, p_commission, p_customer_name, p_customer_account, p_mother_account_id, p_reference, p_notes, auth.uid())
  RETURNING id INTO v_txn_id;

  UPDATE public.hand_cash_accounts SET balance = balance + p_amount WHERE bank_id = p_bank_id;

  IF p_commission > 0 THEN
    SELECT id INTO v_profit_account_id FROM public.profit_accounts WHERE bank_id = p_bank_id LIMIT 1;
    IF v_profit_account_id IS NOT NULL THEN
      UPDATE public.profit_accounts SET balance = balance + p_commission WHERE id = v_profit_account_id;
      UPDATE public.transactions SET profit_account_id = v_profit_account_id WHERE id = v_txn_id;
    END IF;
  END IF;

  RETURN v_txn_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 0c: Update process_withdrawal — only hand cash decreases (mother account is reference only)
CREATE OR REPLACE FUNCTION public.process_withdrawal(
  p_bank_id UUID,
  p_customer_name TEXT,
  p_customer_account TEXT,
  p_amount NUMERIC,
  p_commission NUMERIC,
  p_mother_account_id UUID,
  p_reference TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_txn_id UUID;
  v_profit_account_id UUID;
BEGIN
  INSERT INTO public.transactions (bank_id, type, amount, commission, customer_name, customer_account, mother_account_id, reference, notes, performed_by)
  VALUES (p_bank_id, 'withdrawal', p_amount, p_commission, p_customer_name, p_customer_account, p_mother_account_id, p_reference, p_notes, auth.uid())
  RETURNING id INTO v_txn_id;

  UPDATE public.hand_cash_accounts SET balance = balance - p_amount WHERE bank_id = p_bank_id;

  IF p_commission > 0 THEN
    SELECT id INTO v_profit_account_id FROM public.profit_accounts WHERE bank_id = p_bank_id LIMIT 1;
    IF v_profit_account_id IS NOT NULL THEN
      UPDATE public.profit_accounts SET balance = balance + p_commission WHERE id = v_profit_account_id;
      UPDATE public.transactions SET profit_account_id = v_profit_account_id WHERE id = v_txn_id;
    END IF;
  END IF;

  RETURN v_txn_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 0d: Update process_withdrawal_with_shortage — user specifies mother account deduction
CREATE OR REPLACE FUNCTION public.process_withdrawal_with_shortage(
  p_bank_id UUID,
  p_customer_name TEXT,
  p_customer_account TEXT,
  p_amount NUMERIC,
  p_commission NUMERIC,
  p_mother_account_id UUID,
  p_shortage_amount NUMERIC,
  p_reference TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_txn_id UUID;
  v_profit_account_id UUID;
BEGIN
  INSERT INTO public.transactions (bank_id, type, amount, commission, customer_name, customer_account, mother_account_id, reference, notes, has_shortage, shortage_amount, performed_by)
  VALUES (p_bank_id, 'withdrawal', p_amount, p_commission, p_customer_name, p_customer_account, p_mother_account_id, p_reference, p_notes, TRUE, p_shortage_amount, auth.uid())
  RETURNING id INTO v_txn_id;

  UPDATE public.hand_cash_accounts SET balance = balance - (p_amount - p_shortage_amount) WHERE bank_id = p_bank_id;
  UPDATE public.mother_accounts SET balance = balance - p_shortage_amount WHERE id = p_mother_account_id;

  IF p_commission > 0 THEN
    SELECT id INTO v_profit_account_id FROM public.profit_accounts WHERE bank_id = p_bank_id LIMIT 1;
    IF v_profit_account_id IS NOT NULL THEN
      UPDATE public.profit_accounts SET balance = balance + p_commission WHERE id = v_profit_account_id;
      UPDATE public.transactions SET profit_account_id = v_profit_account_id WHERE id = v_txn_id;
    END IF;
  END IF;

  RETURN v_txn_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 1: Create/replace SECURITY DEFINER helper functions
CREATE OR REPLACE FUNCTION public.get_my_bank_ids()
RETURNS SETOF UUID AS $$
  SELECT bank_id FROM public.bank_members WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_my_admin_bank_ids()
RETURNS SETOF UUID AS $$
  SELECT bank_id FROM public.bank_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Step 2: Drop ALL existing policies on ALL tables
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles', 'banks', 'bank_members', 'mother_accounts',
        'hand_cash_accounts', 'profit_accounts', 'transactions',
        'expense_categories', 'expenses', 'daily_logs', 'alert_configs'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END;
$$;

-- Step 3: Enable RLS on all tables (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mother_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hand_cash_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_configs ENABLE ROW LEVEL SECURITY;

-- Step 4: Recreate ALL policies

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Banks (owner_id = auth.uid() allows owner to see/manage bank even before bank_members row exists)
CREATE POLICY "Members can view bank" ON public.banks FOR SELECT
  USING (id IN (SELECT public.get_my_bank_ids()) OR owner_id = auth.uid());
CREATE POLICY "Owners can create bank" ON public.banks FOR INSERT
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Admins can update bank" ON public.banks FOR UPDATE
  USING (id IN (SELECT public.get_my_admin_bank_ids()) OR owner_id = auth.uid());

-- Bank members
CREATE POLICY "Members can view bank members" ON public.bank_members FOR SELECT
  USING (bank_id IN (SELECT public.get_my_bank_ids()));
CREATE POLICY "Owner or admin can insert members" ON public.bank_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR bank_id IN (SELECT public.get_my_admin_bank_ids())
  );
CREATE POLICY "Admins can update members" ON public.bank_members FOR UPDATE
  USING (bank_id IN (SELECT public.get_my_admin_bank_ids()));
CREATE POLICY "Admins can delete members" ON public.bank_members FOR DELETE
  USING (bank_id IN (SELECT public.get_my_admin_bank_ids()));

-- Mother accounts
CREATE POLICY "Members can view mother accounts" ON public.mother_accounts FOR SELECT
  USING (bank_id IN (SELECT public.get_my_bank_ids()));
CREATE POLICY "Admins can manage mother accounts" ON public.mother_accounts FOR INSERT
  WITH CHECK (bank_id IN (SELECT public.get_my_admin_bank_ids()));
CREATE POLICY "Admins can update mother accounts" ON public.mother_accounts FOR UPDATE
  USING (bank_id IN (SELECT public.get_my_admin_bank_ids()));

-- Hand cash accounts
CREATE POLICY "Members can view hand cash" ON public.hand_cash_accounts FOR SELECT
  USING (bank_id IN (SELECT public.get_my_bank_ids()));
CREATE POLICY "Members can insert hand cash" ON public.hand_cash_accounts FOR INSERT
  WITH CHECK (bank_id IN (SELECT public.get_my_bank_ids()));
CREATE POLICY "Admins can update hand cash" ON public.hand_cash_accounts FOR UPDATE
  USING (bank_id IN (SELECT public.get_my_admin_bank_ids()));

-- Profit accounts
CREATE POLICY "Members can view profit accounts" ON public.profit_accounts FOR SELECT
  USING (bank_id IN (SELECT public.get_my_bank_ids()));
CREATE POLICY "Admins can manage profit accounts" ON public.profit_accounts FOR INSERT
  WITH CHECK (bank_id IN (SELECT public.get_my_admin_bank_ids()));
CREATE POLICY "Admins can update profit accounts" ON public.profit_accounts FOR UPDATE
  USING (bank_id IN (SELECT public.get_my_admin_bank_ids()));

-- Transactions
CREATE POLICY "Members can view transactions" ON public.transactions FOR SELECT
  USING (bank_id IN (SELECT public.get_my_bank_ids()));
CREATE POLICY "Members can create transactions" ON public.transactions FOR INSERT
  WITH CHECK (bank_id IN (SELECT public.get_my_bank_ids()));

-- Expense categories
CREATE POLICY "Members can view categories" ON public.expense_categories FOR SELECT
  USING (bank_id IN (SELECT public.get_my_bank_ids()));
CREATE POLICY "Admins can manage categories" ON public.expense_categories FOR INSERT
  WITH CHECK (bank_id IN (SELECT public.get_my_admin_bank_ids()));
CREATE POLICY "Admins can delete categories" ON public.expense_categories FOR DELETE
  USING (bank_id IN (SELECT public.get_my_admin_bank_ids()));

-- Expenses
CREATE POLICY "Members can view expenses" ON public.expenses FOR SELECT
  USING (bank_id IN (SELECT public.get_my_bank_ids()));
CREATE POLICY "Members can create expenses" ON public.expenses FOR INSERT
  WITH CHECK (bank_id IN (SELECT public.get_my_bank_ids()));

-- Daily logs
CREATE POLICY "Members can view daily logs" ON public.daily_logs FOR SELECT
  USING (bank_id IN (SELECT public.get_my_bank_ids()));
CREATE POLICY "Members can create daily logs" ON public.daily_logs FOR INSERT
  WITH CHECK (bank_id IN (SELECT public.get_my_bank_ids()));

-- Alert configs
CREATE POLICY "Members can view alerts" ON public.alert_configs FOR SELECT
  USING (bank_id IN (SELECT public.get_my_bank_ids()));
CREATE POLICY "Admins can manage alerts" ON public.alert_configs FOR INSERT
  WITH CHECK (bank_id IN (SELECT public.get_my_admin_bank_ids()));
CREATE POLICY "Admins can update alerts" ON public.alert_configs FOR UPDATE
  USING (bank_id IN (SELECT public.get_my_admin_bank_ids()));
