// One situation-fuzzer scenario (`situation-fuzz.mjs`): a small random board
// built around one card, the card cast or activated, a few turns played, and
// the state checked. Imported by `situation-worker.mjs`, one per thread.
//
// The board goes through the engine's own entry paths only — the ones the
// test harness (`src/test/harness.ts`, not in `dist/`) wraps: `Game.create`,
// `debugSpawn` (a silent spawn, or announced for the card's own entry),
// `debugApplyEffect` (token stacks, a token copy, an Equipment attached,
// life gained and lost) and the seats' own answers (what an Aura enchants).
// Nothing writes the state by hand, so every board is one a game could reach.
//
// Every choice is a `RandomController`'s. A scenario runs in three stages:
//   setup — every seat passes priority (and answers any decision at random)
//           while the game reaches the scenario's moment and the board settles;
//   focus — the seat holding the card acts with it (cast it, play it,
//           activate its abilities, up to three times) whenever it can, a seat
//           holding a "spell on the stack" casts that, everyone else passes or
//           answers at random, until the card has acted and the stack is
//           empty (or a full round goes by without it);
//   free  — every seat plays at random for the rest of the turn and two more, so
//           delayed triggers, "until your next turn" effects and attack and
//           upkeep triggers fire.
// Each stage has a step cap: reaching it is a failure (a loop the engine
// doesn't stop). After the focus and free stages the state is checked
// (`checkInvariants`).

import {
  Game,
  POOL_CARDS,
  RandomController,
  TOKEN_CARDS,
  activePlayerOf,
  asPlayerId,
  canCommandAlone,
  colorIdentityOf,
  createDefaultRegistry,
  createRng,
  handsPlayedRevealed,
  isDeckableCard,
  viewFor,
} from "../dist/index.js";

export const SEATS = ["alice", "bob", "carol", "dave"].map(asPlayerId);
const [A, B] = SEATS;

/** Ticks (one action or one step advanced) each stage may take. Measured on
 * 2026-10-31: a whole scenario averaged 150-200 ticks and the longest of the
 * first few hundred took ~550, so each cap is several times anything seen.
 * Past these a scenario is looping, not playing. */
export const STEP_CAPS = { setup: 3000, focus: 6000, free: 30000 };

export const registry = createDefaultRegistry();
const deckable = POOL_CARDS.filter(isDeckableCard);
const byName = new Map(deckable.map((d) => [d.name, d]));
const isLand = (d) => d.types.includes("land");
const PERMANENT = ["creature", "artifact", "enchantment", "planeswalker", "battle", "land"];
const isPermanent = (d) => d.types.some((t) => PERMANENT.includes(t));
const json = (x) => JSON.stringify(x ?? null);

const permanents = deckable.filter((d) => !isLand(d) && isPermanent(d) && !d.subtypes.includes("Aura"));
const creatures = permanents.filter((d) => d.types.includes("creature"));
/** Creatures that are hard to target: hexproof, shroud, ward, protection. */
const guarded = creatures.filter(
  (d) =>
    d.keywords.includes("hexproof") ||
    d.keywords.includes("shroud") ||
    /"protection"/.test(json(d.static)) ||
    /"kind":"ward"/.test(json(d.triggered)),
);
const auras = deckable.filter((d) => d.subtypes.includes("Aura") && !d.types.includes("creature"));
const equipment = deckable.filter((d) => d.subtypes.includes("Equipment") && !d.types.includes("creature"));
const instants = deckable.filter((d) => d.types.includes("instant"));
const spells = deckable.filter((d) => !isLand(d));
const tokens = TOKEN_CARDS.filter(
  (d) => !d.subtypes.includes("Aura") && d.types.some((t) => t === "creature" || t === "artifact" || t === "enchantment"),
);

const BASIC = { W: "Plains", U: "Island", B: "Swamp", R: "Mountain", G: "Forest", C: "Wastes" };
const SNOW = { W: "Snow-Covered Plains", U: "Snow-Covered Island", B: "Snow-Covered Swamp", R: "Snow-Covered Mountain", G: "Snow-Covered Forest", C: "Snow-Covered Wastes" };
const COLORS = ["W", "U", "B", "R", "G"];
const has = (name) => {
  try {
    registry.get(name);
    return true;
  } catch {
    return false;
  }
};

/** Is `name` a card the fuzzer can test: a deckable pool card. */
export const isTestable = (name) => byName.has(name);

/** Where `def` does something from besides hand and battlefield: a
 * graveyard (flashback and its kin, abilities and triggers that work there)
 * or exile. */
function extraZones(def) {
  const zones = [];
  const graveyardCast = ["flashback", "escape", "retrace", "disturb", "harmonize", "mayhem", "aftermath", "dredge", "embalm", "eternalize", "unearth", "scavenge"];
  if (
    graveyardCast.some((k) => Boolean(def[k])) ||
    def.activated.some((a) => a.zone === "graveyard") ||
    def.triggered.some((t) => t.fromGraveyard) ||
    /"zone":"graveyard"/.test(json(def.static))
  ) {
    zones.push("graveyard");
  }
  if (def.activated.some((a) => a.zone === "exile") || /"zone":"exile"/.test(json(def.static))) zones.push("exile");
  return zones;
}

/** A small seeded toolkit over one generator. */
function dice(seed) {
  const rng = createRng(seed);
  const r = () => rng.next();
  const int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  const pick = (list) => list[Math.min(list.length - 1, Math.floor(r() * list.length))];
  const chance = (p) => r() < p;
  return { r, int, pick, chance };
}

/** The lands that pay `cost` (a mana-cost string), from `colors` for the
 * generic part — snow-covered where there is one, when `snow`. */
function landsFor(cost, colors, d, snow = false) {
  const out = [];
  const generic = () => (colors.length === 0 ? "Wastes" : BASIC[d.pick(colors)]);
  for (const sym of cost?.match(/\{[^}]+\}/g) ?? []) {
    const inner = sym.slice(1, -1);
    if (/^\d+$/.test(inner)) for (let i = 0; i < Number(inner); i++) out.push(generic());
    else if (inner === "X" || inner === "Y") for (let i = d.int(0, 3); i > 0; i--) out.push(generic());
    else if (inner === "S") out.push(has(SNOW[colors[0] ?? "C"]) ? SNOW[colors[0] ?? "C"] : generic());
    else {
      const parts = inner.split("/").filter((p) => BASIC[p] !== undefined);
      if (parts.length > 0) out.push(BASIC[d.pick(parts)]);
      else if (/^\d+\//.test(inner)) out.push(generic());
    }
  }
  return snow ? out.map((n) => (has(`Snow-Covered ${n}`) ? `Snow-Covered ${n}` : n)) : out;
}

/**
 * A `RandomController` held to a script: in `setup` it passes (answering any
 * decision at random); in `focus` it acts with its `focus` card whenever it
 * can, up to `budget` times, and passes otherwise; in `free` it is a
 * `RandomController` that leaves stand-alone mana abilities alone and passes
 * empty steps more often (see `act`).
 */
class SituationController extends RandomController {
  constructor(player, random, scene) {
    super(player, random);
    this.scene = scene;
    this.pickFrom = random;
    /** The name this seat acts with in the focus stage, or null. */
    this.focus = null;
    this.budget = 0;
    this.acted = 0;
    /** Asked in the focus stage and had nothing it could do with its card —
     * in the step `idleAt` names (`stepKey`), the only one it holds for. */
    this.idle = false;
    this.idleAt = "";
  }

  act(view) {
    if (view.state.awaiting !== null) return super.act(view);
    if (this.scene.stage === "free") {
      // Most of a free stage is priority passed in empty steps, each paying
      // for a full scan of the legal actions: with the stack empty, outside
      // its own main phase, a seat passes four times in five without looking.
      const s = view.state;
      const ownMain = activePlayerOf(s) === this.playerId && (s.turn.step === "precombat-main" || s.turn.step === "postcombat-main");
      if (s.zones.shared.stack.length === 0 && !ownMain && this.pickFrom() < 0.8) return { type: "pass-priority", player: this.playerId };
      // A plain RandomController, but one that doesn't tap a land for mana
      // nobody asked for — most of a free stage's actions were that, each a
      // tick at ~1 ms. A cast pays its own mana; the card's own mana
      // abilities stay on offer.
      const all = view.legalActions();
      const legal = all.filter((o) => !(o.kind === "activate-ability" && o.manaAbility === true) || this.isFocusCard(o, view.state));
      return super.act(legal.length === all.length ? view : { ...view, legalActions: () => legal });
    }
    if (this.scene.stage === "focus" && this.focus !== null && this.budget > 0) {
      const offers = view.legalActions().filter((o) => this.isFocus(o, view.state));
      this.idle = offers.length === 0;
      this.idleAt = stepKey(view.state);
      if (offers.length > 0) {
        // Its mana abilities only when it has nothing else.
        const real = offers.filter((o) => !(o.kind === "activate-ability" && o.manaAbility === true));
        const from = real.length > 0 ? real : offers;
        const offer = from[Math.min(from.length - 1, Math.floor(this.pickFrom() * from.length))];
        this.budget -= 1;
        this.acted += 1;
        this.scene.actions.push(`${this.playerId}: ${offer.kind} ${offer.text ?? offer.cardName ?? ""}`.trim());
        // What `RandomController.act` reads first, for its target picks.
        this.facts = view.targetFacts;
        return this.toAction(offer);
      }
    }
    return { type: "pass-priority", player: this.playerId };
  }

  isFocus(offer, state) {
    return this.isFocusCard(offer, state, this.focus);
  }

  /** Does `offer` act with a card named `name` (the scenario's card, by
   * default) — cast it, play it, activate it. */
  isFocusCard(offer, state, name = this.scene.card) {
    if (offer.kind === "pass-priority") return false;
    const id = offer.card ?? offer.source ?? offer.permanent;
    const object = id === undefined ? undefined : state.objects[id];
    return object !== undefined && (object.cardName === name || object.copyOf === name);
  }
}

/** A turn and step, as a key. */
const stepKey = (s) => `${s.turn.number}:${s.turn.step}`;

/** Nothing on the stack, nothing asked, no trigger waiting. */
const quiet = (s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0;

class StepCapError extends Error {}

/** Run until `done` or the game ends, at most `cap` ticks. */
function runStage(game, scene, stage, done) {
  scene.stage = stage;
  let ticks = 0;
  game.advanceUntil((s) => {
    ticks += 1;
    if (ticks > STEP_CAPS[stage]) throw new StepCapError(`step cap: ${STEP_CAPS[stage]} ticks in the ${stage} stage without finishing (${where(s)})`);
    return done(s);
  });
  scene.ticks += ticks;
}

/** Where a game is: its turn and step, the stack, the battlefield's most
 * repeated names. */
function where(s) {
  const counts = new Map();
  for (const id of s.zones.shared.battlefield) {
    const o = s.objects[id];
    if (o === undefined) continue;
    const name = o.copyOf ?? o.cardName;
    counts.set(name, (counts.get(name) ?? 0) + (o.stackCount ?? 1));
  }
  const most = [...counts].sort((x, y) => y[1] - x[1]).slice(0, 3).map(([n, k]) => `${k}x ${n}`).join(", ");
  const stack = s.zones.shared.stack.map((id) => s.objects[id]?.cardName ?? id).join(", ");
  return `turn ${s.turn.number} ${activePlayerOf(s)} ${s.turn.step}, stack [${stack}], awaiting ${s.awaiting?.kind ?? "none"}, battlefield ${most}`;
}

/** The board in a few lines: each seat's life, battlefield, hand, graveyard. */
export function describeBoard(game, extra) {
  const s = game.state;
  const name = (o) => `${o.copyOf !== null && o.copyOf !== undefined ? `${o.cardName}=copy of ${o.copyOf}` : o.cardName}${o.isToken ? " token" : ""}`;
  const lines = [];
  for (const p of s.turnOrder) {
    const perms = [];
    const lands = new Map();
    for (const id of s.zones.shared.battlefield) {
      const o = s.objects[id];
      if (o.controller !== p) continue;
      if (registry.get(o.cardName).types.includes("land") && !o.isToken && o.attachedTo === null) {
        lands.set(o.cardName, (lands.get(o.cardName) ?? 0) + 1);
        continue;
      }
      const host = o.attachedTo === null ? "" : ` on ${s.objects[o.attachedTo]?.cardName ?? "?"}`;
      perms.push(`${name(o)}${(o.stackCount ?? 1) > 1 ? ` x${o.stackCount}` : ""}${o.tapped ? " (tapped)" : ""}${host}`);
    }
    const zone = (z) => s.zones.perPlayer[p][z].map((id) => s.objects[id]?.cardName ?? "?");
    const landText = [...lands].map(([n, k]) => `${n} x${k}`).join(", ");
    lines.push(
      `  ${p} (life ${s.players[p].life}): ${[...perms, landText].filter(Boolean).join("; ") || "nothing"}` +
        ` | hand: ${zone("hand").join(", ") || "-"} | graveyard: ${zone("graveyard").join(", ") || "-"}`,
    );
  }
  const stack = s.zones.shared.stack.map((id) => `${s.objects[id]?.cardName} (${s.objects[id]?.controller})`);
  const exile = s.zones.shared.exile.map((id) => s.objects[id]?.cardName);
  const command = s.zones.shared.command.map((id) => s.objects[id]?.cardName);
  return [
    `  ${extra}; turn ${s.turn.number}, ${activePlayerOf(s)}'s ${s.turn.step}` +
      `${stack.length ? `; stack: ${stack.join(", ")}` : ""}${exile.length ? `; exile: ${exile.join(", ")}` : ""}${command.length ? `; command: ${command.join(", ")}` : ""}`,
    ...lines,
  ].join("\n");
}

// ------------------------------------------------------------------ checks

/** Every value in `state` is plain data that survives `structuredClone` and
 * JSON alike: no functions, class instances, `Map`/`Set`, non-finite numbers
 * or cycles. The path of the first one that isn't, or null.
 *
 * `undefined` in an array (JSON makes it `null`) goes into `holes` instead:
 * a blank target slot is `undefined` by design (`ResolvedTargets`), and the
 * engine reads `!== undefined` — so a state restored from JSON (a capture, a
 * saved local game) reads a blank slot as chosen. That's BACKLOG's "Blank
 * target slots don't survive JSON" (docs/engine-gaps.md): reported, not
 * failed, until it's fixed — then make a hole a problem again. */
function plainProblem(root, holes = []) {
  const ancestors = new Set();
  const visit = (v, at) => {
    if (v === null || typeof v === "string" || typeof v === "boolean") return null;
    if (typeof v === "number") return Number.isFinite(v) ? null : `${at} is ${v}`;
    if (typeof v === "undefined") return null;
    if (typeof v !== "object") return `${at} is a ${typeof v}`;
    if (ancestors.has(v)) return `${at} is a cycle`;
    const proto = Object.getPrototypeOf(v);
    const isArray = Array.isArray(v);
    if (!isArray && proto !== Object.prototype && proto !== null) return `${at} is a ${v.constructor?.name ?? "class instance"}`;
    ancestors.add(v);
    try {
      if (isArray) {
        for (let i = 0; i < v.length; i++) {
          if (v[i] === undefined) {
            holes.push(`${at}[${i}]`.replace(/obj-\d+/g, "obj-N"));
            continue;
          }
          const p = visit(v[i], `${at}[${i}]`);
          if (p !== null) return p;
        }
      } else {
        for (const k of Object.keys(v)) {
          const p = visit(v[k], `${at}.${k}`);
          if (p !== null) return p;
        }
      }
    } finally {
      ancestors.delete(v);
    }
    return null;
  };
  return visit(root, "state");
}

/**
 * The state is plain and self-contained, and every seat's view hides what it
 * should. Throws with what failed.
 */
export function checkInvariants(game, label, holes = []) {
  const s = game.state;
  const problem = plainProblem(s, holes);
  if (problem !== null) throw new Error(`invariant (${label}): state isn't plain data: ${problem}`);
  structuredClone(s);
  // A JSON round trip restores a game that offers every seat the same actions.
  const restored = Game.fromSnapshot(JSON.parse(JSON.stringify(s)), { registry });
  for (const p of s.turnOrder) {
    if (s.players[p].hasLost) continue;
    const before = JSON.stringify(game.legalActions(p));
    const after = JSON.stringify(restored.legalActions(p));
    if (before !== after) {
      throw new Error(`invariant (${label}): ${p}'s legal actions differ after a JSON round trip of the state\n    before: ${before.slice(0, 300)}\n    after:  ${after.slice(0, 300)}`);
    }
  }
  // Each seat's view: no card in another player's hand, or in any library,
  // unless something shows it (a reveal this turn, a revealed library top, a
  // hand played revealed, a decision that has its player look at it).
  const awaitingIds = new Set(JSON.stringify(s.awaiting ?? null).match(/obj-\d+/g) ?? []);
  for (const viewer of s.turnOrder) {
    const view = viewFor(s, registry, viewer);
    const shown = new Set([...s.revealedThisTurn, ...Object.values(view.revealedLibraryTop ?? {}).filter(Boolean)]);
    const revealedHands = handsPlayedRevealed(s, registry, viewer);
    for (const p of s.turnOrder) {
      const zones = s.zones.perPlayer[p];
      const hidden = [...zones.library, ...(p === viewer || revealedHands.has(p) ? [] : zones.hand)];
      for (const id of hidden) {
        if (view.objects[id] === undefined || shown.has(id) || awaitingIds.has(id)) continue;
        const where = zones.library.includes(id) ? "library" : "hand";
        throw new Error(`invariant (${label}): ${viewer}'s view shows ${s.objects[id]?.cardName} in ${p}'s ${where}`);
      }
    }
  }
}

// ------------------------------------------------------------------ scenario

/**
 * Build and play scenario `seed` for `cardName`. `players` (2 or 4) is the
 * seed's own choice unless given. `onBoard(description)` is called once the
 * board is laid out, before anything is played — so a hang can be reported
 * with it. Returns `{ ticks, acted, actions, description }`; throws on any
 * failure (an engine throw, a step cap, an invariant), the error carrying
 * `.stage` and `.description`.
 */
export function runScenario(cardName, seed, { players: forcedPlayers = null, onBoard = () => {} } = {}) {
  const def = byName.get(cardName);
  if (def === undefined) throw new Error(`not a deckable pool card: ${cardName}`);
  const d = dice(seed * 7919 + hashName(cardName));
  const players = forcedPlayers ?? (d.chance(0.5) ? 2 : 4);
  const seats = SEATS.slice(0, players);
  const identity = [...colorIdentityOf(def, registry)];
  const colorsOf = new Map(seats.map((p) => [p, p === A ? identity : Array.from({ length: d.int(1, 2) }, () => d.pick(COLORS))]));

  // Where the card starts. A commander (one that can command alone) now and
  // then starts in the command zone, cast from there.
  const zones = ["hand", "hand"];
  if (isPermanent(def)) zones.push("battlefield", "battlefield");
  zones.push(...extraZones(def));
  const asCommander = canCommandAlone(def) && d.chance(0.15);
  let startZone = asCommander ? "command" : d.pick(zones);

  const scene = { card: cardName, stage: "setup", ticks: 0, actions: [] };
  const controllers = Object.fromEntries(
    seats.map((p, i) => {
      const rng = createRng(seed * 31 + i);
      return [p, new SituationController(p, () => rng.next(), scene)];
    }),
  );
  // A library each: basics of the seat's colours and a few random spells, so
  // the free stage's draws are real cards now and then.
  const library = (p) => {
    const colors = colorsOf.get(p);
    const basics = Array.from({ length: 24 }, () => (colors.length === 0 ? "Wastes" : BASIC[d.pick(colors)]));
    return [...basics, ...Array.from({ length: 6 }, () => d.pick(spells).name)];
  };
  const commander = asCommander || players === 4;
  const game = Game.create({
    seed,
    registry,
    startingPlayer: A,
    mulligans: false,
    controllers,
    rules: { openingHandSize: 0, startingLife: commander ? 40 : 20 },
    decks: seats.map((p) => ({ player: p, cards: library(p), ...(p === A && asCommander ? { commanders: [cardName] } : {}) })),
  });

  let description = null;
  const holes = [];
  try {
    // The moment: alice's first main phase, or (now and then) a step of bob's
    // turn where alice holds priority — for a card that acts at instant speed.
    const oppStep = d.chance(0.3) ? d.pick(["upkeep", "draw", "begin-combat", "end"]) : null;
    const moment = oppStep === null ? "alice's precombat main" : `bob's ${oppStep}`;
    runStage(game, scene, "setup", (s) =>
      oppStep === null
        ? s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A
        : activePlayerOf(s) === B && s.turn.step === oppStep && s.priority.holder === A,
    );
    const settle = () => runStage(game, scene, "setup", quiet);
    const objectsOn = (p, filter = () => true) =>
      game.state.zones.shared.battlefield.filter((id) => {
        const o = game.state.objects[id];
        return o.controller === p && filter(o);
      });
    const isCreature = (o) => game.characteristics(o.id).types.includes("creature");
  /** Aura `name` onto the battlefield under `p`, attached to something it can
   * enchant (rule 303.4f) — `debugSpawn` doesn't ask, and an Aura attached to
   * nothing is a board no game reaches. Tried on a few permanents (creatures
   * first) and players at random; with none it can enchant it goes to the
   * graveyard instead (in a game it would stay where it was — 303.4g). Its
   * id, or null. */
  const auraOnto = (name, p) => {
    const id = game.debugSpawn(name, p, "battlefield", { summoningSick: false });
    const shuffle = (list) => list.map((x) => [d.r(), x]).sort((x, y) => x[0] - y[0]).map(([, x]) => x);
    const permanents = game.state.zones.shared.battlefield.filter((h) => h !== id).map((object) => ({ kind: "object", object }));
    const [creatureRefs, otherRefs] = [true, false].map((want) => permanents.filter((r) => isCreature(game.state.objects[r.object]) === want));
    const candidates = [...shuffle(creatureRefs), ...shuffle(otherRefs).slice(0, 3), ...shuffle(seats.map((player) => ({ kind: "player", player })))].slice(0, 10);
    const on = () => game.state.objects[id]?.attachedTo != null || game.state.objects[id]?.attachedToPlayer !== undefined;
    for (const host of candidates) {
      if (on()) break;
      game.debugApplyEffect(p, { kind: "attach", target: 0 }, [host], { source: id });
    }
    if (on()) return id;
    if (game.state.objects[id]?.zone === "battlefield") game.debugMove(id, "graveyard");
    return null;
  };

    // Life totals, some way off the start.
    for (const p of seats) {
      if (!d.chance(0.5)) continue;
      const start = game.state.players[p].life;
      if (d.chance(0.7)) game.debugApplyEffect(p, { kind: "lose-life", amount: d.int(1, start - 1) });
      else game.debugApplyEffect(p, { kind: "gain-life", amount: d.int(1, 20) });
      settle();
    }

    // Mana: lands for the card's cost and a few more (abilities, X) for alice;
    // a few for everyone else, to answer with.
    for (const p of seats) {
      const colors = colorsOf.get(p);
      // Snow lands for a card that counts snow mana (Blessing of Frost's X).
      const snow = p === A && /\bsnow\b/i.test(def.text ?? "");
      const names =
        p === A
          ? [...landsFor(def.manaCost, colors, d, snow), ...landsFor(`{${d.int(2, 6)}}`, colors, d, snow)]
          : landsFor(`{${d.int(1, 5)}}`, colors, d);
      for (const name of names.slice(0, 16)) game.debugSpawn(name, p, "battlefield", { summoningSick: false });
    }

    // A few permanents a side, some tapped.
    for (const p of seats) {
      for (let k = d.int(0, 4); k > 0; k--) {
        game.debugSpawn(d.pick(permanents).name, p, "battlefield", { summoningSick: false, tapped: d.chance(0.2) });
        settle();
      }
    }
    // A creature that's hard to target, usually an opponent's.
    if (guarded.length > 0 && d.chance(0.5)) {
      game.debugSpawn(d.pick(guarded).name, d.chance(0.75) ? d.pick(seats.slice(1)) : A, "battlefield", { summoningSick: false });
      settle();
    }
    // A token stack.
    if (tokens.length > 0 && d.chance(0.35)) {
      game.debugApplyEffect(d.pick(seats), { kind: "create-token", token: d.pick(tokens).name, count: d.int(2, 5) });
      settle();
    }
    // An Aura, attached as it enters.
    if (auras.length > 0 && d.chance(0.3)) {
      auraOnto(d.pick(auras).name, d.pick(seats));
      settle();
    }
    // Equipment, attached to one of its controller's creatures.
    if (equipment.length > 0 && d.chance(0.3)) {
      const p = d.pick(seats);
      const gear = game.debugSpawn(d.pick(equipment).name, p, "battlefield", { summoningSick: false });
      const hosts = objectsOn(p, isCreature);
      if (hosts.length > 0 && game.state.objects[gear]?.zone === "battlefield") {
        game.debugApplyEffect(p, { kind: "attach", target: 0 }, [{ kind: "object", object: d.pick(hosts) }], { source: gear });
      }
      settle();
    }
    // A token copy of something on the battlefield.
    if (d.chance(0.2)) {
      // Not an Aura: its copy would enter attached to nothing.
      const others = game.state.zones.shared.battlefield.filter((id) => {
        const def = registry.get(game.state.objects[id].cardName);
        return !def.types.includes("land") && !def.subtypes.includes("Aura");
      });
      if (others.length > 0) {
        const of = d.pick(others);
        game.debugApplyEffect(game.state.objects[of].controller, { kind: "create-token-copy", of: 0, count: 1 }, [{ kind: "object", object: of }]);
        settle();
      }
    }
    // Hands and graveyards: a few random cards, an instant now and then.
    for (const p of seats) {
      for (let k = d.int(0, 2); k > 0; k--) game.debugSpawn(d.pick(spells).name, p, "hand");
      if (p !== A && d.chance(0.3)) game.debugSpawn(d.pick(instants).name, p, "hand");
      for (let k = d.int(0, 3); k > 0; k--) game.debugSpawn(d.pick(deckable).name, p, "graveyard");
    }
    // Another copy of the card, an opponent's.
    if (isPermanent(def) && !isLand(def) && d.chance(0.1)) {
      game.debugSpawn(cardName, d.pick(seats.slice(1)), "battlefield", { summoningSick: false, announceEntry: true });
      settle();
    }
    // A spell to put on the stack: some seat casts it in the focus stage, so
    // the card meets it there (or it meets the card).
    let stackCaster = null;
    if (d.chance(0.25) && instants.length > 0) {
      stackCaster = d.pick(seats);
      const spell = d.pick(instants);
      game.debugSpawn(spell.name, stackCaster, "hand");
      for (const name of landsFor(spell.manaCost, colorsOf.get(stackCaster), d)) game.debugSpawn(name, stackCaster, "battlefield");
      if (stackCaster !== A) {
        controllers[stackCaster].focus = spell.name;
        controllers[stackCaster].budget = 1;
      }
    }

    // The card itself, last, so its entry sees the board.
    if (startZone === "battlefield" && def.subtypes.includes("Aura")) {
      const id = auraOnto(cardName, A);
      if (id !== null) game.debugAnnounceEntry(id);
      else startZone = "graveyard";
    } else if (startZone === "battlefield") game.debugSpawn(cardName, A, "battlefield", { summoningSick: d.chance(0.3), announceEntry: true });
    else if (startZone !== "command") game.debugSpawn(cardName, A, startZone);
    settle();
    description = describeBoard(game, `${cardName} in alice's ${startZone}; ${players} players; at ${moment}`);
    onBoard(description);

    // Focus: alice acts with the card (up to three times), the stack spell's
    // caster casts it.
    controllers[A].focus = cardName;
    controllers[A].budget = d.int(1, 3);
    const focused = seats.filter((p) => controllers[p].focus !== null);
    const startTurn = game.state.turn.number;
    runStage(game, scene, "focus", (s) => {
      if (s.turn.number > startTurn + players) return true;
      if (!quiet(s)) return false;
      // Each focused seat has spent its budget, or has nothing to do with
      // its card now — after acting, or in its own main phase (sorcery
      // timing: nothing later this turn would let it). The stack spell's
      // caster casts it when it first can, or not at all.
      return focused.every((p) => {
        const c = controllers[p];
        const ownMain = activePlayerOf(s) === p && (s.turn.step === "precombat-main" || s.turn.step === "postcombat-main");
        return c.budget === 0 || (c.idle && c.idleAt === stepKey(s) && (c.acted > 0 || ownMain || p !== A));
      });
    });
    if (!game.state.result.over) checkInvariants(game, "after the card acted", holes);
    // Free: the rest of this turn and two more, at random.
    const freeFrom = game.state.turn.number;
    const extra = 2;
    if (!game.state.result.over) runStage(game, scene, "free", (s) => s.turn.number > freeFrom + extra);
    checkInvariants(game, "after the free turns", holes);
  } catch (error) {
    if (error instanceof Error) {
      error.stage = scene.stage;
      // The board as laid out, or as it stood when the setup failed.
      let board = description;
      try {
        board ??= describeBoard(game, `${cardName} on its way to alice's ${startZone}; ${players} players; the board when the setup failed`);
      } catch {
        board = "  (the board couldn't be described)";
      }
      error.description = board;
      error.actions = scene.actions;
    }
    throw error;
  }
  return { holes: [...new Set(holes)], startZone, ticks: scene.ticks, acted: controllers[A].acted, actions: scene.actions, description };
}

function hashName(name) {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 1_000_003;
}
