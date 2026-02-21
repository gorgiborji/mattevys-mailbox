-- Mailboxes table: each couple gets one
CREATE TABLE mailboxes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Our Mailbox',
  invite_code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(4), 'hex'),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mailbox members: maps users to their mailbox
CREATE TABLE mailbox_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mailbox_id UUID NOT NULL REFERENCES mailboxes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mailbox_id, user_id)
);

-- Add mailbox_id and user_id to ideas
ALTER TABLE ideas
  ADD COLUMN mailbox_id UUID REFERENCES mailboxes(id),
  ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Index for fast mailbox-scoped queries
CREATE INDEX idx_ideas_mailbox ON ideas(mailbox_id) WHERE deleted IS NOT TRUE;

-- Push tokens for notifications
CREATE TABLE push_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'ios',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, expo_push_token)
);

-- RLS: Enable on all tables
ALTER TABLE mailboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mailbox_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Mailbox policies
CREATE POLICY "Users can view own mailbox"
  ON mailboxes FOR SELECT
  USING (id IN (SELECT mailbox_id FROM mailbox_members WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can create mailboxes"
  ON mailboxes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Mailbox members policies
CREATE POLICY "Users can view own mailbox members"
  ON mailbox_members FOR SELECT
  USING (mailbox_id IN (SELECT mailbox_id FROM mailbox_members WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can join mailboxes"
  ON mailbox_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Ideas policies
CREATE POLICY "Users can view own mailbox ideas"
  ON ideas FOR SELECT
  USING (mailbox_id IN (SELECT mailbox_id FROM mailbox_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can create ideas in own mailbox"
  ON ideas FOR INSERT
  WITH CHECK (mailbox_id IN (SELECT mailbox_id FROM mailbox_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update ideas in own mailbox"
  ON ideas FOR UPDATE
  USING (mailbox_id IN (SELECT mailbox_id FROM mailbox_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete ideas in own mailbox"
  ON ideas FOR DELETE
  USING (mailbox_id IN (SELECT mailbox_id FROM mailbox_members WHERE user_id = auth.uid()));

-- Push token policies
CREATE POLICY "Users manage own push tokens"
  ON push_tokens FOR ALL
  USING (user_id = auth.uid());
