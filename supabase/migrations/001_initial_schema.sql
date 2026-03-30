-- MatFlow v2: Initial Schema
-- Supabase Postgres with Row Level Security

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  first_name text,
  last_name text,
  avatar_url text,
  role text not null default 'member' check (role in ('super_admin', 'gym_admin', 'instructor', 'member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    'member'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- GYMS
-- ============================================
create table public.gyms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  logo_url text,
  primary_color text not null default '#0fe69b',
  secondary_color text,
  timezone text not null default 'America/Chicago',
  phone text,
  website text,
  stripe_customer_id text,
  subscription_status text not null default 'inactive' check (subscription_status in ('trialing', 'active', 'past_due', 'cancelled', 'inactive')),
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- GYM MEMBERS (links profiles to gyms)
-- ============================================
create table public.gym_members (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references public.gyms on delete cascade,
  profile_id uuid not null references public.profiles on delete cascade,
  role text not null default 'member' check (role in ('super_admin', 'gym_admin', 'instructor', 'member')),
  belt_rank text not null default 'white' check (belt_rank in ('white', 'blue', 'purple', 'brown', 'black')),
  stripes int not null default 0 check (stripes >= 0 and stripes <= 4),
  approved boolean not null default false,
  active boolean not null default true,
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(gym_id, profile_id)
);

-- ============================================
-- BELT PROGRESS
-- ============================================
create table public.belt_progress (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references public.gyms on delete cascade,
  member_id uuid not null references public.gym_members on delete cascade,
  belt_rank text not null check (belt_rank in ('white', 'blue', 'purple', 'brown', 'black')),
  stripes int not null default 0,
  note text,
  awarded_at timestamptz not null default now(),
  awarded_by text,
  created_at timestamptz not null default now()
);

-- ============================================
-- TECHNIQUE PROGRESS
-- ============================================
create table public.technique_progress (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references public.gyms on delete cascade,
  member_id uuid not null references public.gym_members on delete cascade,
  technique_id text not null,
  completed_at timestamptz not null default now(),
  verified_by text,
  created_at timestamptz not null default now(),
  unique(gym_id, member_id, technique_id)
);

-- ============================================
-- CLASS SCHEDULES
-- ============================================
create table public.class_schedules (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references public.gyms on delete cascade,
  day_of_week int not null check (day_of_week >= 0 and day_of_week <= 6),
  start_time time not null,
  end_time time not null,
  class_type text not null check (class_type in ('gi', 'nogi', 'kids', 'fundamentals', 'competition', 'womens', 'self_defense')),
  instructor text,
  location_slug text,
  topic text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- ATTENDANCE
-- ============================================
create table public.attendance (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references public.gyms on delete cascade,
  member_id uuid not null references public.gym_members on delete cascade,
  class_date date not null,
  class_type text not null,
  checked_in_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(gym_id, member_id, class_date, class_type)
);

-- ============================================
-- SCHEDULE COMMITMENTS
-- ============================================
create table public.schedule_commitments (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references public.gyms on delete cascade,
  member_id uuid not null references public.gym_members on delete cascade,
  class_date date not null,
  class_type text not null,
  created_at timestamptz not null default now(),
  unique(gym_id, member_id, class_date, class_type)
);

-- ============================================
-- CATEGORIES
-- ============================================
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references public.gyms on delete cascade,
  name text not null,
  slug text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================
-- PRODUCTS
-- ============================================
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references public.gyms on delete cascade,
  name text not null,
  slug text not null,
  description text,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  featured boolean not null default false,
  active boolean not null default true,
  category_id uuid references public.categories on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- PRODUCT IMAGES
-- ============================================
create table public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products on delete cascade,
  url text not null,
  alt text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================
-- PRODUCT VARIANTS
-- ============================================
create table public.product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products on delete cascade,
  size text,
  color text,
  stock int not null default 0,
  sku text,
  created_at timestamptz not null default now()
);

-- ============================================
-- ORDERS
-- ============================================
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references public.gyms on delete cascade,
  member_id uuid references public.gym_members on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- ORDER ITEMS
-- ============================================
create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders on delete cascade,
  product_id uuid not null references public.products on delete cascade,
  variant_id uuid references public.product_variants on delete set null,
  quantity int not null default 1,
  unit_price numeric(10,2) not null,
  created_at timestamptz not null default now()
);

-- ============================================
-- VIDEOS
-- ============================================
create table public.videos (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references public.gyms on delete cascade,
  title text not null,
  description text,
  embed_url text not null,
  class_type text,
  class_date date,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- ANNOUNCEMENTS
-- ============================================
create table public.announcements (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references public.gyms on delete cascade,
  title text not null,
  content text not null,
  pinned boolean not null default false,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- EVENTS
-- ============================================
create table public.events (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references public.gyms on delete cascade,
  title text not null,
  description text,
  date timestamptz not null,
  end_date timestamptz,
  event_type text,
  location_slug text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- COMPETITION RESULTS
-- ============================================
create table public.competition_results (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references public.gyms on delete cascade,
  member_id uuid not null references public.gym_members on delete cascade,
  competition_name text not null,
  date date not null,
  placement text,
  division text,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================
-- PERSONAL GOALS
-- ============================================
create table public.personal_goals (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references public.gyms on delete cascade,
  member_id uuid not null references public.gym_members on delete cascade,
  title text not null,
  target_value int,
  current_value int not null default 0,
  goal_type text,
  start_date date,
  end_date date,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.gyms enable row level security;
alter table public.gym_members enable row level security;
alter table public.belt_progress enable row level security;
alter table public.technique_progress enable row level security;
alter table public.class_schedules enable row level security;
alter table public.attendance enable row level security;
alter table public.schedule_commitments enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.videos enable row level security;
alter table public.announcements enable row level security;
alter table public.events enable row level security;
alter table public.competition_results enable row level security;
alter table public.personal_goals enable row level security;

-- PROFILES: Users can read/update their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- GYMS: Members can view their gym, anyone can create
create policy "Members can view their gym" on public.gyms for select using (
  exists (select 1 from public.gym_members where gym_members.gym_id = gyms.id and gym_members.profile_id = auth.uid())
);
create policy "Authenticated users can create gyms" on public.gyms for insert with check (auth.uid() is not null);
create policy "Gym admins can update their gym" on public.gyms for update using (
  exists (select 1 from public.gym_members where gym_members.gym_id = gyms.id and gym_members.profile_id = auth.uid() and gym_members.role in ('gym_admin', 'super_admin'))
);

-- GYM MEMBERS: Members can view their gym's members, admins can manage
create policy "Members can view gym members" on public.gym_members for select using (
  exists (select 1 from public.gym_members gm where gm.gym_id = gym_members.gym_id and gm.profile_id = auth.uid())
);
create policy "Users can join gyms" on public.gym_members for insert with check (auth.uid() = profile_id);
create policy "Admins can update members" on public.gym_members for update using (
  exists (select 1 from public.gym_members gm where gm.gym_id = gym_members.gym_id and gm.profile_id = auth.uid() and gm.role in ('gym_admin', 'super_admin'))
);

-- GYM-SCOPED TABLES: Members see their gym's data, admins can write
-- Belt Progress
create policy "Members can view belt progress" on public.belt_progress for select using (
  exists (select 1 from public.gym_members where gym_members.gym_id = belt_progress.gym_id and gym_members.profile_id = auth.uid())
);
create policy "Admins can manage belt progress" on public.belt_progress for insert with check (
  exists (select 1 from public.gym_members where gym_members.gym_id = belt_progress.gym_id and gym_members.profile_id = auth.uid() and gym_members.role in ('gym_admin', 'instructor', 'super_admin'))
);

-- Technique Progress
create policy "Members can view technique progress" on public.technique_progress for select using (
  exists (select 1 from public.gym_members where gym_members.gym_id = technique_progress.gym_id and gym_members.profile_id = auth.uid())
);
create policy "Members can log technique progress" on public.technique_progress for insert with check (
  exists (select 1 from public.gym_members where gym_members.gym_id = technique_progress.gym_id and gym_members.profile_id = auth.uid())
);

-- Class Schedules
create policy "Members can view class schedules" on public.class_schedules for select using (
  exists (select 1 from public.gym_members where gym_members.gym_id = class_schedules.gym_id and gym_members.profile_id = auth.uid())
);
create policy "Admins can manage class schedules" on public.class_schedules for all using (
  exists (select 1 from public.gym_members where gym_members.gym_id = class_schedules.gym_id and gym_members.profile_id = auth.uid() and gym_members.role in ('gym_admin', 'super_admin'))
);

-- Attendance
create policy "Members can view attendance" on public.attendance for select using (
  exists (select 1 from public.gym_members where gym_members.gym_id = attendance.gym_id and gym_members.profile_id = auth.uid())
);
create policy "Members can log attendance" on public.attendance for insert with check (
  exists (select 1 from public.gym_members where gym_members.gym_id = attendance.gym_id and gym_members.profile_id = auth.uid())
);

-- Schedule Commitments
create policy "Members can view commitments" on public.schedule_commitments for select using (
  exists (select 1 from public.gym_members where gym_members.gym_id = schedule_commitments.gym_id and gym_members.profile_id = auth.uid())
);
create policy "Members can manage own commitments" on public.schedule_commitments for insert with check (
  exists (select 1 from public.gym_members where gym_members.gym_id = schedule_commitments.gym_id and gym_members.profile_id = auth.uid())
);
create policy "Members can delete own commitments" on public.schedule_commitments for delete using (
  exists (select 1 from public.gym_members gm where gm.gym_id = schedule_commitments.gym_id and gm.profile_id = auth.uid() and gm.id = schedule_commitments.member_id)
);

-- Products (public for shop)
create policy "Anyone can view active products" on public.products for select using (active = true);
create policy "Admins can manage products" on public.products for all using (
  exists (select 1 from public.gym_members where gym_members.gym_id = products.gym_id and gym_members.profile_id = auth.uid() and gym_members.role in ('gym_admin', 'super_admin'))
);

-- Product Images
create policy "Anyone can view product images" on public.product_images for select using (true);

-- Product Variants
create policy "Anyone can view product variants" on public.product_variants for select using (true);

-- Categories
create policy "Anyone can view categories" on public.categories for select using (true);
create policy "Admins can manage categories" on public.categories for all using (
  exists (select 1 from public.gym_members where gym_members.gym_id = categories.gym_id and gym_members.profile_id = auth.uid() and gym_members.role in ('gym_admin', 'super_admin'))
);

-- Orders
create policy "Members can view own orders" on public.orders for select using (
  exists (select 1 from public.gym_members where gym_members.gym_id = orders.gym_id and gym_members.profile_id = auth.uid())
);
create policy "Members can create orders" on public.orders for insert with check (
  exists (select 1 from public.gym_members where gym_members.gym_id = orders.gym_id and gym_members.profile_id = auth.uid())
);
create policy "Admins can update orders" on public.orders for update using (
  exists (select 1 from public.gym_members where gym_members.gym_id = orders.gym_id and gym_members.profile_id = auth.uid() and gym_members.role in ('gym_admin', 'super_admin'))
);

-- Order Items
create policy "Members can view order items" on public.order_items for select using (true);
create policy "Members can create order items" on public.order_items for insert with check (true);

-- Videos
create policy "Members can view published videos" on public.videos for select using (
  published = true and exists (select 1 from public.gym_members where gym_members.gym_id = videos.gym_id and gym_members.profile_id = auth.uid())
);
create policy "Admins can manage videos" on public.videos for all using (
  exists (select 1 from public.gym_members where gym_members.gym_id = videos.gym_id and gym_members.profile_id = auth.uid() and gym_members.role in ('gym_admin', 'super_admin'))
);

-- Announcements
create policy "Members can view announcements" on public.announcements for select using (
  exists (select 1 from public.gym_members where gym_members.gym_id = announcements.gym_id and gym_members.profile_id = auth.uid())
);
create policy "Admins can manage announcements" on public.announcements for all using (
  exists (select 1 from public.gym_members where gym_members.gym_id = announcements.gym_id and gym_members.profile_id = auth.uid() and gym_members.role in ('gym_admin', 'super_admin'))
);

-- Events
create policy "Members can view events" on public.events for select using (
  exists (select 1 from public.gym_members where gym_members.gym_id = events.gym_id and gym_members.profile_id = auth.uid())
);
create policy "Admins can manage events" on public.events for all using (
  exists (select 1 from public.gym_members where gym_members.gym_id = events.gym_id and gym_members.profile_id = auth.uid() and gym_members.role in ('gym_admin', 'super_admin'))
);

-- Competition Results
create policy "Members can view competition results" on public.competition_results for select using (
  exists (select 1 from public.gym_members where gym_members.gym_id = competition_results.gym_id and gym_members.profile_id = auth.uid())
);
create policy "Admins can manage competition results" on public.competition_results for all using (
  exists (select 1 from public.gym_members where gym_members.gym_id = competition_results.gym_id and gym_members.profile_id = auth.uid() and gym_members.role in ('gym_admin', 'super_admin'))
);

-- Personal Goals
create policy "Members can view own goals" on public.personal_goals for select using (
  exists (select 1 from public.gym_members gm where gm.gym_id = personal_goals.gym_id and gm.profile_id = auth.uid() and gm.id = personal_goals.member_id)
);
create policy "Members can manage own goals" on public.personal_goals for insert with check (
  exists (select 1 from public.gym_members gm where gm.gym_id = personal_goals.gym_id and gm.profile_id = auth.uid() and gm.id = personal_goals.member_id)
);
create policy "Members can update own goals" on public.personal_goals for update using (
  exists (select 1 from public.gym_members gm where gm.gym_id = personal_goals.gym_id and gm.profile_id = auth.uid() and gm.id = personal_goals.member_id)
);
create policy "Admins can view all goals" on public.personal_goals for select using (
  exists (select 1 from public.gym_members where gym_members.gym_id = personal_goals.gym_id and gym_members.profile_id = auth.uid() and gym_members.role in ('gym_admin', 'super_admin'))
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_gym_members_gym_id on public.gym_members(gym_id);
create index idx_gym_members_profile_id on public.gym_members(profile_id);
create index idx_attendance_gym_member on public.attendance(gym_id, member_id);
create index idx_attendance_date on public.attendance(class_date);
create index idx_class_schedules_gym on public.class_schedules(gym_id);
create index idx_products_gym on public.products(gym_id);
create index idx_orders_gym on public.orders(gym_id);
create index idx_videos_gym on public.videos(gym_id);
create index idx_announcements_gym on public.announcements(gym_id);
create index idx_events_gym on public.events(gym_id);
create index idx_gyms_slug on public.gyms(slug);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at();
create trigger update_gyms_updated_at before update on public.gyms for each row execute function public.update_updated_at();
create trigger update_gym_members_updated_at before update on public.gym_members for each row execute function public.update_updated_at();
create trigger update_class_schedules_updated_at before update on public.class_schedules for each row execute function public.update_updated_at();
create trigger update_products_updated_at before update on public.products for each row execute function public.update_updated_at();
create trigger update_orders_updated_at before update on public.orders for each row execute function public.update_updated_at();
create trigger update_videos_updated_at before update on public.videos for each row execute function public.update_updated_at();
create trigger update_announcements_updated_at before update on public.announcements for each row execute function public.update_updated_at();
create trigger update_events_updated_at before update on public.events for each row execute function public.update_updated_at();
create trigger update_personal_goals_updated_at before update on public.personal_goals for each row execute function public.update_updated_at();
