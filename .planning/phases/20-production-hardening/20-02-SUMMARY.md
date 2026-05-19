# Plan 20-02: Supabase RPC ile Atomik Token Ledger

## Tasks Completed
1. `supabase/migrations/20260519111746_deduct_token_rpc.sql` migration dosyası oluşturularak `deduct_token_if_sufficient` isminde bir RPC (Stored Procedure) eklendi.
2. Bu RPC içerisine, PostgreSQL tabanlı `pg_advisory_xact_lock(hashtext(p_user_id))` fonksiyonu ile satır bazlı kilit mekanizması kurularak Race Condition durumu %100 engellendi.
3. `src/app/api/research/route.ts` içerisinde yapılan güvensiz, manuel "Bakiye oku -> Kontrol et -> Ledger'a -1 insert at" işlemi kaldırılarak doğrudan RPC çağrısına dönüştürüldü.
