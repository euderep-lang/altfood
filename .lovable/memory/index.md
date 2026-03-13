Design system: Teal primary #0F766E, Inter font, mobile-first, rounded-2xl cards
Database: food_categories, foods, doctors, page_views, substitution_queries, referrals, rate_limits, hidden_foods, site_settings
Categories seeded with TACO data (463 foods across 10 categories)
Doctors table has: referral_code (auto-generated), referred_by columns
Referral program: 30-day extended trial for referred, 1 month Pro for referrer
Password minimum: 8 characters (not 6)
Admin email: carine@dracarinecassol.com.br
Edge functions: send-email, welcome-email, weekly-summary, upgrade-nudge, check-rate-limit, mp-webhook, create-checkout
New categories: Temperos e Condimentos, Bebidas Funcionais, Suplementos Alimentares
hidden_foods table: doctor_id + food_id, per-doctor food visibility control
Auto-confirm email enabled for signup flow
