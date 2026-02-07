import { supabase } from './supabaseClient';

export const userService = {
  async getMembers(bankId) {
    const { data, error } = await supabase
      .from('bank_members')
      .select('*, profiles(*)')
      .eq('bank_id', bankId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async inviteUser(bankId, email, fullName, phone, invitedBy) {
    // Create user via Supabase Auth admin (requires service role or edge function)
    // For client-side, we'll use the standard signUp with a temporary password
    // and the user will reset their password via email
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        data: { full_name: fullName },
      },
    });

    if (authError) throw authError;

    if (authData.user) {
      // Update profile
      await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: fullName,
          phone: phone || null,
        });

      // Create bank_members record
      const { error: memberError } = await supabase
        .from('bank_members')
        .insert({
          bank_id: bankId,
          user_id: authData.user.id,
          role: 'user',
          invited_by: invitedBy,
        });
      if (memberError) throw memberError;
    }

    return authData;
  },

  async removeMember(memberId) {
    const { error } = await supabase
      .from('bank_members')
      .delete()
      .eq('id', memberId);
    if (error) throw error;
  },

  async updateRole(memberId, role) {
    const { data, error } = await supabase
      .from('bank_members')
      .update({ role })
      .eq('id', memberId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
