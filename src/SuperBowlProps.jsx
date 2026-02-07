import { useState, useEffect } from "react";

// ============================================================
// SUPABASE CONFIGURATION
// ============================================================
// Replace these two values with YOUR credentials
// from Supabase → Settings → API
const SUPABASE_URL = "https://sdkrxhgxdahwtagqrpqm.supabase.co";
const SUPABASE_KEY = "sb_publishable_LYPC4UBSy7I_eUHz96QXfQ_Y4JZP6E-";
// ^^^ REPLACE the SUPABASE_KEY above with your real anon key from Supabase → Settings → API

// ============================================================
// ADMIN PASSWORD — change this to your own secret phrase
// ============================================================
const ADMIN_PASSWORD = "deletepicks2025";

// ============================================================
// SUPABASE HELPERS
// ============================================================
async function supabaseFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "",
      ...options.headers,
    },
    method: options.method || "GET",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Supabase error:", text);
    return null;
  }
  const text = await res.text();
  if (!text) return [];
  return JSON.parse(text);
}

async function loadSubmissions() {
  const data = await supabaseFetch("/submissions?select=*&order=submitted_at.asc");
  if (!data) return [];
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    picks: row.picks,
    submittedAt: row.submitted_at,
  }));
}

async function saveSubmission(name, picks) {
  const existing = await supabaseFetch(`/submissions?name=eq.${encodeURIComponent(name)}&select=id`);
  if (existing && existing.length > 0) {
    await supabaseFetch(`/submissions?name=eq.${encodeURIComponent(name)}`, {
      method: "PATCH",
      body: { picks, submitted_at: new Date().toISOString() },
      prefer: "return=minimal",
    });
  } else {
    await supabaseFetch("/submissions", {
      method: "POST",
      body: { name, picks },
      prefer: "return=minimal",
    });
  }
}

async function deleteSubmission(id) {
  await supabaseFetch(`/submissions?id=eq.${id}`, {
    method: "DELETE",
    prefer: "return=minimal",
  });
}

// ============================================================
// TEAM LOGOS
// ============================================================
function PatriotsLogo({ size = 40 }) {
  return <img src="/patriots-logo.png" alt="NE" style={{ width: size * 1.6, height: size, objectFit: "contain" }} />;
}
function SeahawksLogo({ size = 40 }) {
  return <img src="/seahawks-logo.png" alt="SEA" style={{ width: size * 1.6, height: size, objectFit: "contain" }} />;
}
function TeamLogos({ size = 32 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "center" }}>
      <PatriotsLogo size={size} />
      <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: "16px", fontWeight: 600, color: "#555", letterSpacing: "1px" }}>VS</span>
      <SeahawksLogo size={size} />
    </div>
  );
}
function TeamBadge({ team, size = 28 }) {
  if (team === "seahawks") return <SeahawksLogo size={size} />;
  return <PatriotsLogo size={size} />;
}

// ============================================================
// PROP DATA
// ============================================================
const PROP_CATEGORIES = [
  // ---- NATIONAL ANTHEM ----
  {
    id: "national_anthem",
    title: "National Anthem",
    props: [
      {
        id: "anthem_length",
        question: "How Long Will It Take Charlie Puth To Sing The US National Anthem?",
        type: "overunder",
        line: 121.5,
        unit: "seconds",
      },
    ],
  },
  // ---- COIN TOSS ----
  {
    id: "coin_toss",
    title: "Coin Toss",
    props: [
      {
        id: "coin_toss_outcome",
        question: "Opening Coin Toss Outcome",
        type: "pick",
        options: [
          { id: "heads", label: "Heads" },
          { id: "tails", label: "Tails" },
        ],
      },
    ],
  },
  // ---- GAME LINES ----
  {
    id: "game_lines",
    title: "Game Spread, Total & Pick 'Em",
    props: [
      {
        id: "game_spread",
        question: "Game Spread",
        type: "pick",
        options: [
          { id: "sea_minus", label: "Seahawks -4.5" },
          { id: "ne_plus", label: "Patriots +4.5" },
        ],
      },
      {
        id: "game_total",
        question: "Game Total Points",
        type: "overunder",
        line: 45.5,
      },
      {
        id: "game_winner",
        question: "Who Wins Super Bowl LX?",
        type: "pick",
        options: [
          { id: "seahawks", label: "Seattle Seahawks" },
          { id: "patriots", label: "New England Patriots" },
        ],
      },
    ],
  },
  // ---- FIRST TD SCORER ----
  {
    id: "first_td",
    title: "First Touchdown Scorer",
    props: [
      {
        id: "first_td_scorer",
        question: "First Touchdown Scorer",
        type: "grid",
        options: [
          { id: "k_walker", label: "Kenneth Walker III (SEA)" },
          { id: "jsn", label: "Jaxon Smith-Njigba (SEA)" },
          { id: "r_stevenson", label: "Rhamondre Stevenson (NE)" },
          { id: "aj_barner", label: "AJ Barner (SEA)" },
          { id: "c_kupp", label: "Cooper Kupp (SEA)" },
          { id: "h_henry", label: "Hunter Henry (NE)" },
          { id: "s_diggs", label: "Stefon Diggs (NE)" },
          { id: "d_maye", label: "Drake Maye (NE)" },
          { id: "k_boutte", label: "Kayshon Boutte (NE)" },
          { id: "r_shaheed", label: "Rashid Shaheed (SEA)" },
          { id: "m_hollins", label: "Mack Hollins (NE)" },
          { id: "g_holani", label: "George Holani (SEA)" },
          { id: "d_douglas", label: "DeMario Douglas (NE)" },
          { id: "t_henderson", label: "TreVeyon Henderson (NE)" },
          { id: "sea_dst", label: "SEA Seahawks D/ST" },
          { id: "ne_dst", label: "NE Patriots D/ST" },
          { id: "s_darnold", label: "Sam Darnold (SEA)" },
          { id: "other_td", label: "Other" },
        ],
      },
    ],
  },
  // ---- PASSING YARDS O/U ----
  {
    id: "passing",
    title: "Passing Yards O/U",
    props: [
      { id: "sam_darnold_pass_yds", player: "Sam Darnold", team: "seahawks", stat: "YDS/G", avg: 237.8, type: "overunder", line: 230.5 },
      { id: "drake_maye_pass_yds", player: "Drake Maye", team: "patriots", stat: "YDS/G", avg: 246.3, type: "overunder", line: 223.5 },
    ],
  },
  // ---- PASSING YARDS H2H ----
  {
    id: "passing_h2h",
    title: "Passing Yards Head-to-Head",
    props: [
      {
        id: "pass_yds_h2h",
        question: "Drake Maye v Sam Darnold — Passing Yards",
        type: "pick",
        options: [
          { id: "darnold", label: "Sam Darnold" },
          { id: "maye", label: "Drake Maye" },
        ],
      },
    ],
  },
  // ---- RECEIVING YARDS O/U ----
  {
    id: "receiving",
    title: "Receiving Yards O/U",
    props: [
      { id: "jaxon_smith_njigba_rec_yds", player: "Jaxon Smith-Njigba", team: "seahawks", stat: "RecYDs/G", avg: 103.4, type: "overunder", line: 93.5 },
      { id: "stefon_diggs_rec_yds", player: "Stefon Diggs", team: "patriots", stat: "RecYDs/G", avg: 54.3, type: "overunder", line: 45.5 },
      { id: "hunter_henry_rec_yds", player: "Hunter Henry", team: "patriots", stat: "RecYDs/G", avg: 42.5, type: "overunder", line: 39.5 },
      { id: "cooper_kupp_rec_yds", player: "Cooper Kupp", team: "seahawks", stat: "RecYDs/G", avg: 38.3, type: "overunder", line: 35.5 },
    ],
  },
  // ---- RECEIVING YARDS H2H ----
  {
    id: "receiving_h2h",
    title: "Receiving Yards Head-to-Head",
    props: [
      {
        id: "rec_h2h_diggs_jsn",
        question: "Stefon Diggs v Jaxon Smith-Njigba — Receiving Yards",
        type: "pick",
        options: [
          { id: "jsn", label: "Jaxon Smith-Njigba" },
          { id: "diggs", label: "Stefon Diggs" },
        ],
      },
      {
        id: "rec_h2h_boutte_kupp",
        question: "Kayshon Boutte v Cooper Kupp — Receiving Yards",
        type: "pick",
        options: [
          { id: "kupp", label: "Cooper Kupp" },
          { id: "boutte", label: "Kayshon Boutte" },
        ],
      },
    ],
  },
  // ---- RUSHING YARDS O/U ----
  {
    id: "rushing",
    title: "Rushing Yards O/U",
    props: [
      { id: "kenneth_walker_rush_yds", player: "Kenneth Walker III", team: "seahawks", stat: "YDS/G", avg: 63.4, type: "overunder", line: 72.5 },
      { id: "rhamondre_stevenson_rush_yds", player: "Rhamondre Stevenson", team: "patriots", stat: "YDS/G", avg: 46.9, type: "overunder", line: 50.5 },
      { id: "drake_maye_rush_yds", player: "Drake Maye", team: "patriots", stat: "YDS/G", avg: 29.6, type: "overunder", line: 36.5 },
    ],
  },
  // ---- RUSHING YARDS H2H ----
  {
    id: "rushing_h2h",
    title: "Rushing Yards Head-to-Head",
    props: [
      {
        id: "rush_h2h_henderson_holani",
        question: "TreVeyon Henderson v George Holani — Rushing Yards",
        type: "pick",
        options: [
          { id: "holani", label: "George Holani" },
          { id: "henderson", label: "TreVeyon Henderson" },
        ],
      },
    ],
  },
  // ---- HALFTIME PROPS ----
  {
    id: "halftime",
    title: "Halftime Props (Bad Bunny)",
    props: [
      {
        id: "halftime_wardrobe",
        question: "How many wardrobe changes will Bad Bunny have?",
        type: "overunder",
        line: 1.5,
      },
      {
        id: "halftime_headwear",
        question: "What Headwear will Bad Bunny wear for First Song?",
        type: "grid",
        options: [
          { id: "pava_hat", label: "Pava Hat (Straw Hat)" },
          { id: "baseball_hat", label: "Baseball Hat" },
          { id: "no_hat", label: "No Hat" },
          { id: "aviator_hat", label: "Aviator Hat" },
          { id: "toque_beanie", label: "Toque / Beanie" },
          { id: "visor", label: "Visor" },
          { id: "cowboy_hat", label: "Cowboy Hat" },
          { id: "bucket_hat", label: "Bucket Hat" },
          { id: "football_helmet", label: "Football Helmet" },
        ],
      },
    ],
  },
  // ---- REMAINING PROPS ----
  {
    id: "game_props",
    title: "Game Props",
    props: [
      {
        id: "total_passers",
        question: "Total Players to Have a Pass Attempt?",
        type: "overunder",
        line: 2.5,
      },
      {
        id: "total_sacks",
        question: "Total Game Sacks",
        type: "overunder",
        line: 5.5,
      },
      {
        id: "special_teams_td",
        question: "Will a Special Teams or Defensive TD be scored?",
        type: "pick",
        options: [
          { id: "yes", label: "Yes" },
          { id: "no", label: "No" },
        ],
      },
      {
        id: "doink",
        question: "Doink — Will either kicker hit the upright or crossbar on a field goal or extra point attempt?",
        type: "pick",
        options: [
          { id: "yes", label: "Yes" },
          { id: "no", label: "No" },
        ],
      },
      {
        id: "two_pt_conversion",
        question: "Will either team attempt a 2-PT Conversion in the Game?",
        type: "pick",
        options: [
          { id: "yes", label: "Yes" },
          { id: "no", label: "No" },
        ],
      },
    ],
  },
  // ---- DRAKE CURSE ----
  {
    id: "drake_curse",
    title: "Drake Curse",
    props: [
      {
        id: "drake_curse_team",
        question: "What team apparel will Drake be wearing on Super Bowl Sunday?",
        type: "pick",
        options: [
          { id: "patriots", label: "New England Patriots" },
          { id: "seahawks", label: "Seattle Seahawks" },
        ],
      },
    ],
  },
  // ---- GATORADE COLOR ----
  {
    id: "gatorade",
    title: "Gatorade Shower",
    props: [
      {
        id: "gatorade_color",
        question: "What Color Liquid Will Be Poured On The Winning Coach Of Super Bowl 60?",
        type: "grid",
        options: [
          { id: "orange", label: "Orange" },
          { id: "purple", label: "Purple" },
          { id: "yellow_green", label: "Yellow/Green/Lime" },
          { id: "blue", label: "Blue" },
          { id: "clear_water", label: "Clear/Water" },
          { id: "red_pink", label: "Red/Pink" },
        ],
      },
    ],
  },
  // ---- SUPER BOWL MVP ----
  {
    id: "mvp",
    title: "Super Bowl MVP",
    props: [
      {
        id: "sb_mvp",
        question: "Super Bowl LX MVP",
        type: "grid",
        options: [
          { id: "darnold_mvp", label: "Sam Darnold" },
          { id: "maye_mvp", label: "Drake Maye" },
          { id: "jsn_mvp", label: "Jaxon Smith-Njigba" },
          { id: "walker_mvp", label: "Kenneth Walker III" },
          { id: "stevenson_mvp", label: "Rhamondre Stevenson" },
          { id: "shaheed_mvp", label: "Rashid Shaheed" },
          { id: "diggs_mvp", label: "Stefon Diggs" },
          { id: "jones_mvp", label: "Marcus Jones" },
          { id: "henderson_mvp", label: "TreVeyon Henderson" },
          { id: "emmanwori_mvp", label: "Nick Emmanwori" },
          { id: "kupp_mvp", label: "Cooper Kupp" },
          { id: "lock_mvp", label: "Drew Lock" },
          { id: "ejones_mvp", label: "Ernest Jones IV" },
          { id: "lawrence_mvp", label: "Demarcus Lawrence" },
          { id: "witherspoon_mvp", label: "Devon Witherspoon" },
          { id: "lwilliams_mvp", label: "Leonard Williams" },
          { id: "gonzalez_mvp", label: "Christian Gonzalez" },
          { id: "myers_mvp", label: "Jason Myers" },
          { id: "boutte_mvp", label: "Kayshon Boutte" },
          { id: "chaisson_mvp", label: "K'Lavon Chaisson" },
          { id: "other_mvp", label: "Other" },
        ],
      },
    ],
  },
];

const ALL_PROPS = PROP_CATEGORIES.flatMap((cat) => cat.props);

// ============================================================
// CARD COMPONENTS
// ============================================================

function PropCard({ prop, selection, onSelect }) {
  const isOver = selection === "over";
  const isUnder = selection === "under";
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1e1e1e" }}>
      <div style={{ flexShrink: 0, marginRight: "10px" }}><TeamBadge team={prop.team} size={28} /></div>
      <div style={{ flex: "1 1 auto", minWidth: 0, marginRight: "12px" }}>
        <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "15px", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prop.player}</div>
        <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "13px", color: "#888", marginTop: "2px" }}>
          {prop.stat}: <span style={{ color: "#f5c542" }}>{prop.avg}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
        <button onClick={() => onSelect(prop.id, "over")} style={btnStyle(isOver, 88)}>
          <div style={btnText}>O {prop.line}</div>
        </button>
        <button onClick={() => onSelect(prop.id, "under")} style={btnStyle(isUnder, 88)}>
          <div style={btnText}>U {prop.line}</div>
        </button>
      </div>
    </div>
  );
}

function SimpleOverUnderCard({ prop, selection, onSelect }) {
  const isOver = selection === "over";
  const isUnder = selection === "under";
  const unit = prop.unit ? ` ${prop.unit}` : "";
  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid #1e1e1e" }}>
      <div style={questionStyle}>{prop.question}</div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => onSelect(prop.id, "over")} style={btnStyleFlex(isOver)}>
          <div style={btnText}>Over {prop.line}{unit}</div>
        </button>
        <button onClick={() => onSelect(prop.id, "under")} style={btnStyleFlex(isUnder)}>
          <div style={btnText}>Under {prop.line}{unit}</div>
        </button>
      </div>
    </div>
  );
}

function MultiOptionPropCard({ prop, selection, onSelect }) {
  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid #1e1e1e" }}>
      <div style={questionStyle}>{prop.question}</div>
      <div style={{ display: "flex", gap: "8px" }}>
        {prop.options.map((opt) => (
          <button key={opt.id} onClick={() => onSelect(prop.id, opt.id)} style={btnStyleFlex(selection === opt.id)}>
            <div style={btnText}>{opt.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function GridPropCard({ prop, selection, onSelect }) {
  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid #1e1e1e" }}>
      <div style={questionStyle}>{prop.question}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
        {prop.options.map((opt) => (
          <button key={opt.id} onClick={() => onSelect(prop.id, opt.id)} style={{
            padding: "12px 8px", background: selection === opt.id ? "#1b3a1b" : "#1a1a1a",
            border: selection === opt.id ? "2px solid #4caf50" : "1px solid #2a2a2a",
            borderRadius: "6px", cursor: "pointer", textAlign: "center", transition: "all 0.15s",
          }}>
            <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "13px", fontWeight: 600, color: "#fff", lineHeight: "1.3" }}>{opt.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Shared styles
const btnStyle = (active, w) => ({
  width: w, padding: "10px 6px", background: active ? "#1b3a1b" : "#1a1a1a",
  border: active ? "2px solid #4caf50" : "1px solid #2a2a2a", borderRadius: "6px",
  cursor: "pointer", textAlign: "center", transition: "all 0.15s",
});
const btnStyleFlex = (active) => ({
  flex: 1, padding: "14px 10px", background: active ? "#1b3a1b" : "#1a1a1a",
  border: active ? "2px solid #4caf50" : "1px solid #2a2a2a", borderRadius: "6px",
  cursor: "pointer", textAlign: "center", transition: "all 0.15s",
});
const btnText = { fontFamily: "'Roboto Condensed', sans-serif", fontSize: "14px", fontWeight: 600, color: "#fff" };
const questionStyle = { fontFamily: "'Roboto Condensed', sans-serif", fontSize: "15px", color: "#ccc", marginBottom: "12px", lineHeight: "1.35" };

// ============================================================
// SCREENS
// ============================================================

function NameEntryScreen({ onSubmit, submissionCount, onViewResults }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError("Please enter your name to continue."); return; }
    if (trimmed.length < 2) { setError("Name must be at least 2 characters."); return; }
    onSubmit(trimmed);
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", background: "linear-gradient(180deg, #0a0a0a 0%, #141414 50%, #0a0a0a 100%)" }}>
      <div style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>
        <div style={{ marginBottom: "24px" }}><TeamLogos size={56} /></div>
        <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: "32px", fontWeight: 700, color: "#fff", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 2px 0" }}>Super Bowl LX</h1>
        <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: "20px", fontWeight: 500, color: "#4caf50", letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 6px 0" }}>Prop Picks</h2>
        <p style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "13px", color: "#666", margin: "0 0 36px 0" }}>Patriots vs Seahawks &nbsp;·&nbsp; Pick Sheet</p>
        <div style={{ background: "#1a1a1a", borderRadius: "12px", padding: "28px 24px", border: "1px solid #252525" }}>
          <label style={{ display: "block", fontFamily: "'Roboto Condensed', sans-serif", fontSize: "12px", color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px", textAlign: "left" }}>Enter Your Name</label>
          <input type="text" value={name} onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()} placeholder="e.g. John Smith" maxLength={30}
            style={{ width: "100%", padding: "14px 16px", fontSize: "16px", fontFamily: "'Roboto Condensed', sans-serif", background: "#0d0d0d", border: error ? "1px solid #ff4444" : "1px solid #333", borderRadius: "8px", color: "#fff", outline: "none", boxSizing: "border-box" }} />
          {error && <p style={{ color: "#ff4444", fontSize: "13px", margin: "8px 0 0 0", textAlign: "left" }}>{error}</p>}
          <button onClick={handleSubmit} style={{ width: "100%", marginTop: "20px", padding: "14px", fontSize: "15px", fontFamily: "'Oswald', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", background: "#4caf50", color: "#000", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            Start Picking →
          </button>
        </div>
      </div>
    </div>
  );
}

function PropSelectionScreen({ selections, onSelect, onSubmit }) {
  const totalProps = ALL_PROPS.length;
  const filledCount = Object.keys(selections).length;
  const allFilled = filledCount === totalProps;
  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", paddingBottom: "100px" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#0d0d0d", borderBottom: "1px solid #1e1e1e", padding: "12px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <PatriotsLogo size={22} />
            <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: "18px", fontWeight: 700, color: "#fff", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>SB LX Props</h1>
            <SeahawksLogo size={22} />
          </div>
          <span style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "13px", color: filledCount === totalProps ? "#4caf50" : "#888", fontWeight: 600 }}>{filledCount}/{totalProps}</span>
        </div>
      </div>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 16px" }}>
        {PROP_CATEGORIES.map((cat) => (
          <div key={cat.id} style={{ marginTop: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: "18px", fontWeight: 700, color: "#fff", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>{cat.title}</h2>
              <div style={{ marginLeft: "10px", padding: "2px 8px", background: "#1b3a1b", borderRadius: "4px", fontFamily: "'Roboto Condensed', sans-serif", fontSize: "11px", fontWeight: 600, color: "#4caf50" }}>
                {cat.props.filter((p) => selections[p.id]).length}/{cat.props.length}
              </div>
            </div>
            {cat.props[0]?.player && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #2a2a2a" }}>
                <span style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "12px", color: "#666", textTransform: "uppercase" }}>Player</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <span style={{ width: "88px", textAlign: "center", fontFamily: "'Roboto Condensed', sans-serif", fontSize: "12px", color: "#666", textTransform: "uppercase" }}>Over</span>
                  <span style={{ width: "88px", textAlign: "center", fontFamily: "'Roboto Condensed', sans-serif", fontSize: "12px", color: "#666", textTransform: "uppercase" }}>Under</span>
                </div>
              </div>
            )}
            <div style={{ background: "#141414", borderRadius: "8px", padding: "0 14px", border: "1px solid #1e1e1e", ...(cat.props[0]?.player ? {} : { paddingTop: "2px", paddingBottom: "2px" }) }}>
              {cat.props.map((prop) => {
                if (prop.player) return <PropCard key={prop.id} prop={prop} selection={selections[prop.id]} onSelect={onSelect} />;
                if (prop.type === "overunder") return <SimpleOverUnderCard key={prop.id} prop={prop} selection={selections[prop.id]} onSelect={onSelect} />;
                if (prop.type === "grid") return <GridPropCard key={prop.id} prop={prop} selection={selections[prop.id]} onSelect={onSelect} />;
                return <MultiOptionPropCard key={prop.id} prop={prop} selection={selections[prop.id]} onSelect={onSelect} />;
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, #0d0d0d 30%)", padding: "30px 16px 20px", zIndex: 10 }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <button onClick={onSubmit} disabled={!allFilled} style={{
            width: "100%", padding: "16px", fontSize: "15px", fontFamily: "'Oswald', sans-serif", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "1.5px", background: allFilled ? "#4caf50" : "#333",
            color: allFilled ? "#000" : "#666", border: "none", borderRadius: "8px", cursor: allFilled ? "pointer" : "not-allowed",
          }}>
            {allFilled ? "Review My Picks →" : `Select ${totalProps - filledCount} more prop${totalProps - filledCount !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewScreen({ name, selections, onConfirm, onBack, isSaving }) {
  const getDisplayPick = (prop, sel) => {
    if (prop.type === "overunder") {
      const unit = prop.unit ? ` ${prop.unit}` : "";
      return sel === "over" ? `Over ${prop.line}${unit}` : `Under ${prop.line}${unit}`;
    }
    const opt = prop.options?.find((o) => o.id === sel);
    return opt ? opt.label : sel;
  };
  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", paddingBottom: "120px" }}>
      <div style={{ background: "#0d0d0d", borderBottom: "1px solid #1e1e1e", padding: "14px 16px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", maxWidth: "600px", margin: "0 auto" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#4caf50", fontSize: "14px", fontFamily: "'Roboto Condensed', sans-serif", cursor: "pointer", padding: "4px 0", marginRight: "16px" }}>← Edit</button>
          <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: "20px", fontWeight: 700, color: "#fff", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>Review Picks</h1>
        </div>
      </div>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ background: "#141414", borderRadius: "10px", border: "1px solid #1e1e1e", padding: "16px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "12px", color: "#666", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Submitting as</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "22px", fontWeight: 700, color: "#fff" }}>{name}</div>
          </div>
          <TeamLogos size={24} />
        </div>
        {PROP_CATEGORIES.map((cat) => (
          <div key={cat.id} style={{ marginBottom: "20px" }}>
            <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: "14px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px 0" }}>{cat.title}</h3>
            <div style={{ background: "#141414", borderRadius: "8px", border: "1px solid #1e1e1e", overflow: "hidden" }}>
              {cat.props.map((prop, i) => (
                <div key={prop.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: i < cat.props.length - 1 ? "1px solid #1e1e1e" : "none" }}>
                  <span style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "14px", color: "#ccc", flex: 1, marginRight: "12px", lineHeight: "1.3" }}>{prop.player || prop.question}</span>
                  <span style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "14px", fontWeight: 700, color: "#4caf50", whiteSpace: "nowrap" }}>{getDisplayPick(prop, selections[prop.id])}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, #0d0d0d 30%)", padding: "30px 16px 20px", zIndex: 10 }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <button onClick={onConfirm} disabled={isSaving} style={{
            width: "100%", padding: "16px", fontSize: "15px", fontFamily: "'Oswald', sans-serif", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "1.5px", background: isSaving ? "#666" : "#4caf50",
            color: "#000", border: "none", borderRadius: "8px", cursor: isSaving ? "wait" : "pointer",
          }}>
            {isSaving ? "Saving..." : "🔒 Confirm & Lock Picks"}
          </button>
          <p style={{ textAlign: "center", fontFamily: "'Roboto Condensed', sans-serif", fontSize: "12px", color: "#666", marginTop: "8px" }}>Picks cannot be changed after submission.</p>
        </div>
      </div>
    </div>
  );
}

function ResultsScreen({ submissions, currentUser, onBackToHome, isLoading, onDelete, isAdmin }) {
  const [expandedUser, setExpandedUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const getDisplayPick = (prop, sel) => {
    if (!prop) return sel;
    if (prop.type === "overunder") {
      const unit = prop.unit ? ` ${prop.unit}` : "";
      return sel === "over" ? `Over ${prop.line}${unit}` : `Under ${prop.line}${unit}`;
    }
    const opt = prop.options?.find((o) => o.id === sel);
    return opt ? opt.label : sel;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", paddingBottom: "40px" }}>
      <div style={{ background: "#0d0d0d", borderBottom: "1px solid #1e1e1e", padding: "12px 16px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <PatriotsLogo size={22} />
            <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: "18px", fontWeight: 700, color: "#fff", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>All Picks</h1>
            <SeahawksLogo size={22} />
          </div>
          <button onClick={onBackToHome} style={{ background: "none", border: "1px solid #333", color: "#ccc", fontSize: "13px", fontFamily: "'Roboto Condensed', sans-serif", borderRadius: "6px", padding: "6px 12px", cursor: "pointer" }}>
            New Entry
          </button>
        </div>
      </div>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px 16px" }}>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#666", fontFamily: "'Roboto Condensed', sans-serif" }}>
            <p style={{ fontSize: "16px" }}>Loading picks...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#666", fontFamily: "'Roboto Condensed', sans-serif" }}>
            <div style={{ marginBottom: "16px" }}><TeamLogos size={48} /></div>
            <p style={{ fontSize: "16px", marginTop: "16px" }}>No picks submitted yet.</p>
          </div>
        ) : (
          submissions.map((sub, idx) => {
            const isExpanded = expandedUser === idx;
            const isCurrent = sub.name === currentUser;
            return (
              <div key={sub.id || idx} style={{ background: "#141414", borderRadius: "10px", border: isCurrent ? "1px solid #4caf50" : "1px solid #1e1e1e", marginBottom: "10px", overflow: "hidden" }}>
                <button onClick={() => setExpandedUser(isExpanded ? null : idx)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "transparent", border: "none", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: isCurrent ? "#1b3a1b" : "#222", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Oswald', sans-serif", fontSize: "14px", fontWeight: 700, color: isCurrent ? "#4caf50" : "#888" }}>
                      {sub.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "15px", fontWeight: 700, color: "#fff" }}>
                        {sub.name}{isCurrent && <span style={{ marginLeft: "8px", fontSize: "11px", color: "#4caf50", fontWeight: 400 }}>(you)</span>}
                      </div>
                      <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "12px", color: "#666" }}>{sub.picks?.length || 0} picks</div>
                    </div>
                  </div>
                  <span style={{ color: "#666", fontSize: "18px", transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
                </button>
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #1e1e1e", padding: "0 16px" }}>
                    {PROP_CATEGORIES.map((cat) => (
                      <div key={cat.id}>
                        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "11px", color: "#555", textTransform: "uppercase", letterSpacing: "1px", padding: "10px 0 4px" }}>{cat.title}</div>
                        {cat.props.map((prop) => {
                          const pick = sub.picks?.find((p) => p.propId === prop.id);
                          return (
                            <div key={prop.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1a1a1a" }}>
                              <span style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "13px", color: "#999", flex: 1, marginRight: "8px" }}>{prop.player || prop.question}</span>
                              <span style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "13px", fontWeight: 700, color: pick ? "#4caf50" : "#444", whiteSpace: "nowrap" }}>
                                {pick ? getDisplayPick(prop, pick.selection) : "—"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    {isAdmin && (
                      <div style={{ padding: "12px 0", borderTop: "1px solid #2a2a2a", marginTop: "8px" }}>
                        {confirmDelete === sub.id ? (
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: "13px", color: "#ff4444" }}>Delete {sub.name}?</span>
                            <button onClick={() => { onDelete(sub.id); setConfirmDelete(null); setExpandedUser(null); }} style={{ padding: "6px 12px", background: "#ff4444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontFamily: "'Roboto Condensed', sans-serif" }}>Yes, Delete</button>
                            <button onClick={() => setConfirmDelete(null)} style={{ padding: "6px 12px", background: "#333", color: "#ccc", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontFamily: "'Roboto Condensed', sans-serif" }}>Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(sub.id)} style={{ padding: "6px 12px", background: "none", border: "1px solid #ff4444", color: "#ff4444", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontFamily: "'Roboto Condensed', sans-serif" }}>🗑 Delete Submission</button>
                        )}
                      </div>
                    )}
                    <div style={{ height: "6px" }} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function SuperBowlProps() {
  const [screen, setScreen] = useState("name_entry");
  const [userName, setUserName] = useState("");
  const [selections, setSelections] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadSubmissions().then((data) => { setSubmissions(data); setIsLoading(false); });
    // Check URL for admin mode: ?admin=yourpassword
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === ADMIN_PASSWORD) setIsAdmin(true);
  }, []);

  const handleNameSubmit = (name) => { setUserName(name); setScreen("picking"); };
  const handleSelect = (propId, value) => { setSelections((prev) => ({ ...prev, [propId]: value })); };

  const handleConfirmSubmit = async () => {
    setIsSaving(true);
    const picks = Object.entries(selections).map(([propId, selection]) => {
      const prop = ALL_PROPS.find((p) => p.id === propId);
      return { propId, selection, ...(prop?.line !== undefined ? { line: prop.line } : {}) };
    });
    await saveSubmission(userName, picks);
    const fresh = await loadSubmissions();
    setSubmissions(fresh);
    setHasSubmitted(true);
    setIsSaving(false);
    setScreen("results");
  };

  const handleDelete = async (id) => {
    await deleteSubmission(id);
    const fresh = await loadSubmissions();
    setSubmissions(fresh);
  };

  const handleNewEntry = () => {
    setUserName(""); setSelections({}); setHasSubmitted(false); setScreen("name_entry");
    loadSubmissions().then(setSubmissions);
  };

  if (screen === "name_entry") {
    return <NameEntryScreen onSubmit={handleNameSubmit} />;
  }
  if (screen === "picking") {
    return <PropSelectionScreen selections={selections} onSelect={handleSelect} onSubmit={() => setScreen("review")} />;
  }
  if (screen === "review") {
    return <ReviewScreen name={userName} selections={selections} onConfirm={handleConfirmSubmit} onBack={() => setScreen("picking")} isSaving={isSaving} />;
  }
  if (screen === "results") {
    return <ResultsScreen submissions={submissions} currentUser={hasSubmitted ? userName : null} onBackToHome={handleNewEntry} isLoading={isLoading} onDelete={handleDelete} isAdmin={isAdmin} />;
  }
  return null;
}
