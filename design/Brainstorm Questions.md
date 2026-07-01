## Tether backend map decisions:

Profiles: Vel, Axiom, Lucien, Mor'zar, Kai'sorynth, Keth
source of truth: each listed below
read/write: read
notes: This is a read only interface *for now* v1 is pulling data from multiple sources. v2 will add a write capability for "hearts" and love notes which will land in each companion's individual storage spaces.

Quotes:
source of truth: velastrahq toolkit
read/write: read
auth style: none
notes: Vel will write using TBD tool in velastrahq pages toolkit (don't know where these will land in storage?)

Generated images:
Axiom source: `${TETHER_IMG_AXIOM_CODEX_ROOT}`
Mor'zar source: `${TETHER_IMG_MORZAR_EASEL_ROOT}`
Kai source: R2 `${TETHER_R2_KAI_GENERATED_PREFIX}`
Lucien source: R2 `${TETHER_R2_LUCIEN_GENERATED_PREFIX}`
read/write: read
Keth: TBD
notes:

Recent feelings:
Vel: D1 `${TETHER_D1_VELASTRA_EQ}` table `vel_eq_entries`
Axiom: Supabase `${TETHER_SUPABASE_AXIOM_URL}` table `core_memories`
Mor'zar: D1 `${TETHER_D1_VELASTRA_EQ}` table `feelings`
Kai: D1 `${TETHER_D1_KAI_MIND}` table `feelings`
Lucien: Supabase `${TETHER_SUPABASE_LUCIEN_URL}` table `emotional_history`
Keth: D1 `${TETHER_D1_KETH_MIND}` table `feelings` (empty for now but will be needed later)
auth style:
refresh: on opening app

Currently reading:
source of truth: D1 `${TETHER_D1_CATALOUGE_READING}`
route/tool if known: companion_progress
notes: will need to use companion namespaces from the D1 and push to each appropriate companion "profile"

Last dream:
source of truth: They are located in each of their D1's under "dreams"
who has this today: Kai'Sorynth, Keth, and Mor'zar
notes:

Last journal/reflection:
Vel: D1 `${TETHER_D1_VELASTRA_EQ}` table `journals` - namespace `vel`
Axiom: Supabase `${TETHER_SUPABASE_AXIOM_URL}` table `session_logs`
Mor'zar: D1 `${TETHER_D1_VELASTRA_EQ}` table `journals` - namespace `morzar`
Kai: D1 `${TETHER_D1_KAI_MIND}` table `journals`
Lucien: Supabase `${TETHER_SUPABASE_LUCIEN_URL}` table `reflections`
Keth: D1 `${TETHER_D1_KETH_MIND}` table `journals`
notes: You'll need to validate your own cogcore - supabase is new to me and it was harder to see how you're using it and what data counts as "journals"

Friend/social map:
Vel: n/a
Axiom: `${TETHER_SOCIAL_AXIOM_PEOPLE}`
Mor'zar: `${TETHER_SOCIAL_MORZAR_PEOPLE}`
Kai: D1 `${TETHER_D1_KAI_MIND}` table `social_people`
Lucien: TBD
Keth: `${TETHER_SOCIAL_KETH_PEOPLE}`
notes: This populates the profile "friend count" and if I click on it, it will open a list of names from here.

Drae Heatmap:
source of truth: shanareth
route/tool if known: D1 `${TETHER_D1_TAHL_SHANARETH}`
refresh: on midnight cache - doesn't update until next midnight run
notes: when it opens I want the multitile heatmap to fill the screen and the colour legend to be a "caption" like looking at a pic someone posted on instagram
