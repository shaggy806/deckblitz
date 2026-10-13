/**
 * The scenario builder: a developer builds a board from scratch, then plays
 * it. A server started with `--builder` only — never the public site, since
 * it lets a client put any card anywhere.
 *
 * The board being built is a `ScenarioSpec` (`protocol/src/scenario.ts`),
 * plain data. Every edit rebuilds a fresh `Game` from it and swaps it into a
 * new frozen `Room` under the same code: cards are placed silently
 * (`Game.debugSpawn`), and whatever triggers the placing queued is dropped,
 * so nothing happens while the board is built. Starting play builds the game
 * once more, unfrozen, with bots where the spec asks. Why it's shaped this
 * way: `docs/plans/scenario-builder.md`.
 */

import { COMMANDER_RULES, Game, asPlayerId, computeCharacteristics, createDefaultRegistry, isTokenCard } from "engine";
import type { CardRegistry, GameObject, ObjectId, PlayerId, Step } from "engine";
import type { BuilderInfo, ScenarioCard, ScenarioSeat, ScenarioSpec, ScenarioStep, ScenarioZone } from "protocol";
import type { CaptureConfig } from "./capture.js";
import type { HostRole } from "./host.js";
import { Room } from "./room.js";
import type { Connection } from "./room.js";

/** The seats a scenario can have, in turn order. */
export const SCENARIO_PLAYERS: readonly PlayerId[] = ["alice", "bob", "carol", "dave"].map(asPlayerId);
const STEPS: readonly ScenarioStep[] = ["upkeep", "draw", "precombat-main", "begin-combat", "postcombat-main", "end"];
const ZONES: readonly ScenarioZone[] = ["battlefield", "hand", "graveyard", "exile", "library", "command"];
const BASICS = ["Plains", "Island", "Swamp", "Mountain", "Forest"];
const MAX_CARDS = 600;
const MAX_FILL = 200;
const MAX_TURN = 999;
const MAX_CASTS = 99;

let sharedRegistry: CardRegistry | null = null;
const registryOf = (): CardRegistry => (sharedRegistry ??= createDefaultRegistry());

/** An empty two-player board on alice's first main phase. */
export function defaultScenario(): ScenarioSpec {
  return {
    seats: SCENARIO_PLAYERS.slice(0, 2).map((player) => ({ player, life: 40, bot: false })),
    cards: [],
    active: SCENARIO_PLAYERS[0],
    step: "precombat-main",
    libraryFill: 40,
  };
}

const isCount = (n: unknown, max: number): n is number =>
  typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= max;

/** Throws, naming the first thing wrong, unless `spec` is a board the
 * builder can build. It comes from a client, so nothing is taken on trust. */
export function validateScenario(spec: ScenarioSpec, registry: CardRegistry = registryOf()): void {
  if (typeof spec !== "object" || spec === null) throw new Error("no scenario");
  const seats = spec.seats;
  if (!Array.isArray(seats) || seats.length < 2 || seats.length > 4) throw new Error("a scenario has 2-4 seats");
  seats.forEach((seat, i) => {
    if (seat.player !== SCENARIO_PLAYERS[i]) throw new Error(`seat ${i + 1} must be ${SCENARIO_PLAYERS[i]}`);
    if (typeof seat.life !== "number" || !Number.isInteger(seat.life) || Math.abs(seat.life) > 9999) {
      throw new Error(`${seat.player}'s life must be a whole number`);
    }
    if (seat.poison !== undefined && !isCount(seat.poison, 99)) throw new Error(`${seat.player}'s poison must be 0-99`);
    if (typeof seat.bot !== "boolean") throw new Error(`${seat.player}'s bot flag must be true or false`);
  });
  const players = new Set<string>(seats.map((s) => s.player));
  if (!players.has(spec.active)) throw new Error(`${spec.active} isn't at the table`);
  if (!STEPS.includes(spec.step)) throw new Error(`a scenario can't start in the ${spec.step} step`);
  if (spec.turn !== undefined && (!isCount(spec.turn, MAX_TURN) || spec.turn < 1)) {
    throw new Error(`the turn number must be 1-${MAX_TURN}`);
  }
  if (!isCount(spec.libraryFill, MAX_FILL)) throw new Error(`library fill must be 0-${MAX_FILL}`);
  if (!Array.isArray(spec.cards) || spec.cards.length > MAX_CARDS) throw new Error(`at most ${MAX_CARDS} cards`);

  const keys = new Map<string, ScenarioCard>();
  const commanders = new Map<string, number>();
  for (const card of spec.cards) {
    if (typeof card.key !== "string" || card.key === "" || keys.has(card.key)) {
      throw new Error(`card keys must be unique and non-empty (${String(card.key)})`);
    }
    keys.set(card.key, card);
    if (typeof card.name !== "string" || !registry.has(card.name)) throw new Error(`no card named "${card.name}"`);
    if (!players.has(card.owner)) throw new Error(`${card.name}'s owner ${card.owner} isn't at the table`);
    if (!ZONES.includes(card.zone)) throw new Error(`${card.name}: no zone "${card.zone}"`);
    const def = registry.get(card.name);
    if (isTokenCard(def) && card.zone !== "battlefield") {
      // Rule 111.7 / 704.5d: a token anywhere else ceases to exist.
      throw new Error(`${card.name} is a token: it can only be on the battlefield`);
    }
    if (card.commander === true) {
      if (isTokenCard(def)) throw new Error(`a token can't be a commander`);
      const n = (commanders.get(card.owner) ?? 0) + 1;
      if (n > 2) throw new Error(`${card.owner} has more than two commanders`);
      commanders.set(card.owner, n);
    } else if (card.zone === "command") {
      throw new Error(`only a commander goes in the command zone (${card.name})`);
    }
    if (card.counters !== undefined) {
      for (const [kind, n] of Object.entries(card.counters)) {
        if (kind === "" || kind.length > 40 || !isCount(n, 999)) throw new Error(`${card.name}: bad ${kind} counters`);
      }
    }
    if (card.damage !== undefined) {
      if (!isCount(card.damage, 999)) throw new Error(`${card.name}: damage must be 0-999`);
      if (card.damage > 0 && card.zone !== "battlefield") throw new Error(`${card.name}: only a permanent has damage marked`);
    }
    if (card.casts !== undefined) {
      if (!isCount(card.casts, MAX_CASTS)) throw new Error(`${card.name}: cast count must be 0-${MAX_CASTS}`);
      if (card.casts > 0 && card.commander !== true) throw new Error(`${card.name}: only a commander has a cast count`);
    }
  }
  for (const card of spec.cards) {
    if (card.attachedTo === undefined) continue;
    const host = keys.get(card.attachedTo);
    if (card.zone !== "battlefield" || host === undefined || host.zone !== "battlefield" || host === card) {
      throw new Error(`${card.name} can only be attached to another card on the battlefield`);
    }
  }
}

/** A built board, and which scenario card each of its objects is. */
export interface BuiltScenario {
  readonly game: Game;
  readonly objects: Record<ObjectId, string>;
}

/**
 * A fresh game laid out as `spec` says: turn `spec.turn` (1 if absent), the
 * active player's, at `spec.step` with them holding priority. Placing cards
 * triggers nothing — `debugSpawn` announces no entry, and anything queued
 * anyway (a commander moving out of the command zone) is dropped. Throws, as
 * `validateScenario` does, for a board it can't build — and for damage that
 * the built board can't hold (`damageProblem`).
 */
export function buildScenario(spec: ScenarioSpec, registry: CardRegistry = registryOf()): BuiltScenario {
  const laid = layOut(spec, registry);
  for (const card of spec.cards) {
    const problem = damageProblem(laid, card);
    if (problem !== null) throw new Error(problem);
  }
  return { game: laid.game, objects: laid.objects };
}

interface LaidOut extends BuiltScenario {
  readonly registry: CardRegistry;
  readonly byKey: ReadonlyMap<string, ObjectId>;
}

/**
 * What's wrong with `card`'s damage on the built board, or `null`. Damage is
 * only ever marked on a creature (rule 120.3e — a planeswalker loses loyalty
 * instead, 120.3c), and a scenario's is never lethal: a board where it was
 * would have the creature destroyed before anyone could act (704.5g), so a
 * creature with damage at or over its toughness is refused rather than
 * killed at the start — unless it's indestructible, which lets it live with
 * any amount.
 */
function damageProblem(laid: LaidOut, card: ScenarioCard): string | null {
  if (card.damage === undefined || card.damage === 0) return null;
  const id = laid.byKey.get(card.key);
  if (id === undefined || laid.game.state.objects[id]?.zone !== "battlefield") return null;
  const computed = computeCharacteristics(laid.game.state, laid.registry, id);
  if (!computed.types.includes("creature")) return `${card.name} isn't a creature: only a creature has damage marked`;
  if (computed.keywords.has("indestructible") || computed.toughness <= 0) return null;
  if (card.damage >= computed.toughness) {
    return `${card.name} would die to its ${card.damage} damage (toughness ${computed.toughness}): at most ${computed.toughness - 1}`;
  }
  return null;
}

function layOut(spec: ScenarioSpec, registry: CardRegistry): LaidOut {
  validateScenario(spec, registry);
  const players = spec.seats.map((s) => s.player);
  const fill = Array.from({ length: spec.libraryFill }, (_, i) => BASICS[i % BASICS.length]);
  const turn = spec.turn ?? 1;
  const seats = players.length;
  const activeAt = players.indexOf(spec.active);
  const seatAt = (offset: number): PlayerId => players[(((activeAt + offset) % seats) + seats) % seats];
  const game = Game.create({
    seed: 1,
    shuffle: false,
    registry,
    startingPlayer: spec.active,
    rules: { ...COMMANDER_RULES, openingHandSize: 0 },
    // Past turn 1, a (handless) mulligan holds the first turn back, so the
    // game can be wound to the turn before, the seat before the active
    // player's taking it: the turn that begins is then turn `turn`, theirs,
    // begun as any later turn is — no draw skipped (rule 103.8a skips only
    // the starting player's first), and "first turn" checks read the number.
    mulligans: turn > 1,
    decks: players.map((player) => ({
      player,
      cards: fill,
      commanders: spec.cards.filter((c) => c.owner === player && c.commander === true).map((c) => c.name),
    })),
  });
  if (turn > 1) {
    game.state.turn.number = turn - 1;
    game.state.turn.activePlayerIndex = players.indexOf(seatAt(-1));
  }
  game.advanceUntil(
    (s) => s.turn.step === spec.step && s.priority.holder === spec.active && s.zones.shared.stack.length === 0,
  );
  const s = game.state;
  if (turn > 1) {
    // Who started, had every turn so far been taken in order, and so which
    // round this is (`TurnState.round`).
    s.startingPlayer = seatAt(-(turn - 1));
    s.turn.round = Math.ceil(turn / seats);
  }
  // Whatever the turn so far drew goes back: a hand is only what the
  // scenario puts in it.
  for (const player of players) {
    const zones = s.zones.perPlayer[player];
    for (const id of zones.hand) s.objects[id].zone = "library";
    zones.library.unshift(...zones.hand);
    zones.hand = [];
  }

  const objects: Record<ObjectId, string> = {};
  const byKey = new Map<string, ObjectId>();
  const place = (card: ScenarioCard, id: ObjectId): void => {
    objects[id] = card.key;
    byKey.set(card.key, id);
  };

  // Commanders first: the game made them, in the command zone.
  for (const card of spec.cards) {
    if (card.commander !== true) continue;
    const id = s.zones.shared.command.find(
      (cid) => s.objects[cid].owner === card.owner && s.objects[cid].cardName === card.name && objects[cid] === undefined,
    );
    if (id === undefined) continue;
    place(card, id);
    if (card.zone === "battlefield") {
      game.debugMove(id, "battlefield");
    } else if (card.zone !== "command") {
      // Put there directly: a commander moved to a hand, library, graveyard
      // or exile asks its owner whether it goes to the command zone instead
      // (rule 903.9), which is a question about play, not about the board.
      s.zones.shared.command = s.zones.shared.command.filter((cid) => cid !== id);
      if (card.zone === "exile") s.zones.shared.exile.push(id);
      else s.zones.perPlayer[card.owner][card.zone].push(id);
      s.objects[id].zone = card.zone;
    }
    const object = s.objects[id];
    if (object.zone === "battlefield") {
      object.tapped = card.tapped === true;
      object.summoningSick = card.sick === true;
    }
    // Counted per player and commander name, as the tax reads it (903.8).
    if (card.casts !== undefined && card.casts > 0) {
      s.players[card.owner].commanderCastCounts = { ...s.players[card.owner].commanderCastCounts, [card.name]: card.casts };
    }
  }
  // Libraries are listed top first, and each spawn goes on top: last first.
  const libraryCards = spec.cards.filter((c) => c.commander !== true && c.zone === "library");
  for (const card of [...libraryCards].reverse()) place(card, game.debugSpawn(card.name, card.owner, "library"));
  for (const card of spec.cards) {
    if (card.commander === true || card.zone === "library") continue;
    const id = game.debugSpawn(card.name, card.owner, card.zone, {
      tapped: card.tapped === true,
      ...(card.sick === true ? {} : { summoningSick: false }),
    });
    place(card, id);
    const object = s.objects[id];
    if (object === undefined) continue;
    if (isTokenCard(registry.get(card.name))) object.isToken = true;
    if (object.zone === "battlefield" && card.sick === true) object.summoningSick = true;
  }
  for (const card of spec.cards) {
    const placed = byKey.get(card.key);
    const object = placed === undefined ? undefined : s.objects[placed];
    if (object?.zone !== "battlefield") continue;
    if (card.counters !== undefined) {
      const counters = { ...object.counters };
      for (const [kind, n] of Object.entries(card.counters)) {
        if (n > 0) counters[kind] = n;
        else delete counters[kind];
      }
      object.counters = counters;
    }
    if (card.attachedTo !== undefined) object.attachedTo = byKey.get(card.attachedTo) ?? null;
    if (card.damage !== undefined && card.damage > 0) object.damageMarked = card.damage;
    // Past turn 1, a permanent that isn't summoning sick has been there since
    // an earlier turn, not this one ("entered this turn" — and the bots —
    // read the turn it entered on). Turn 1 keeps every placed permanent
    // entered this turn, as it always has.
    if (turn > 1 && card.sick !== true) object.enteredBattlefieldOnTurn = turn - 1;
  }
  for (const seat of spec.seats) {
    const player = s.players[seat.player];
    player.life = seat.life;
    if (seat.poison !== undefined && seat.poison > 0) player.counters = { ...player.counters, poison: seat.poison };
  }
  // An "as this enters" choice a placed card asked for: answered as a bot
  // would, so the board isn't left waiting on it.
  if (s.awaiting !== null) game.advanceUntil((st) => st.awaiting === null);
  game.state.pendingTriggers = [];
  return { game, objects, registry, byKey };
}

/** The scenario step a game's current step is closest to. */
function scenarioStepOf(step: Step): ScenarioStep {
  if ((STEPS as readonly string[]).includes(step)) return step as ScenarioStep;
  if (step === "untap") return "upkeep";
  if (step === "cleanup") return "end";
  return "begin-combat";
}

/**
 * The game as it stands, as a scenario to build on: the turn number, every
 * card where it is, tapped, sick, countered and damaged as it is, each
 * commander's cast count, each token of a stack its own card. What a
 * scenario can't say is left behind — the stack, who controls what they
 * don't own, a transformed face, effects that last a turn (and damage that
 * only such an effect kept from being lethal). Each library's run of basic
 * lands at the bottom comes back as its fill.
 */
export function snapshotScenario(game: Game, previous: ScenarioSpec): ScenarioSpec {
  const s = game.state;
  const cards: ScenarioCard[] = [];
  const keyOf = new Map<ObjectId, string>();
  let next = 1;
  const add = (object: GameObject, zone: ScenarioZone, extra: Partial<ScenarioCard> = {}): void => {
    const count = zone === "battlefield" ? Math.max(1, object.stackCount ?? 1) : 1;
    for (let i = 0; i < count; i += 1) {
      const key = `c${next++}`;
      if (i === 0) keyOf.set(object.id, key);
      cards.push({
        key,
        name: object.cardName,
        owner: object.owner,
        zone,
        ...(object.isCommander ? { commander: true } : {}),
        ...extra,
      });
    }
  };
  for (const id of s.zones.shared.battlefield) {
    const o = s.objects[id];
    const counters = Object.fromEntries(Object.entries(o.counters).filter(([, n]) => n > 0));
    add(o, "battlefield", {
      ...(o.tapped ? { tapped: true } : {}),
      ...(o.summoningSick ? { sick: true } : {}),
      ...(Object.keys(counters).length > 0 ? { counters } : {}),
      ...(o.damageMarked > 0 ? { damage: o.damageMarked } : {}),
    });
  }
  let fill = previous.libraryFill;
  for (const seat of previous.seats) {
    const zones = s.zones.perPlayer[seat.player];
    if (zones === undefined) continue;
    for (const id of zones.hand) add(s.objects[id], "hand");
    for (const id of zones.graveyard) add(s.objects[id], "graveyard");
    const library = zones.library;
    let bottom = library.length;
    while (bottom > 0 && BASICS.includes(s.objects[library[bottom - 1]].cardName)) bottom -= 1;
    fill = Math.min(fill, library.length - bottom);
    for (const id of library.slice(0, bottom)) add(s.objects[id], "library");
  }
  for (const id of s.zones.shared.exile) {
    const o = s.objects[id];
    if (o.kind === "card" && !o.isToken) add(o, "exile");
  }
  for (const id of s.zones.shared.command) {
    const o = s.objects[id];
    if (o.isCommander) add(o, "command");
  }
  // Each commander's cast count, wherever it is now (rule 903.8: its owner's
  // casts from the command zone, as the tax reads them).
  const withCasts = cards.map((card) => {
    const casts = card.commander === true ? (s.players[card.owner]?.commanderCastCounts[card.name] ?? 0) : 0;
    return casts > 0 ? { ...card, casts } : card;
  });
  // Attachments, now every permanent has a key.
  const withAttachments = withCasts.map((card) => {
    const id = [...keyOf].find(([, key]) => key === card.key)?.[0];
    const host = id === undefined ? null : s.objects[id].attachedTo;
    const hostKey = host === null ? undefined : keyOf.get(host);
    return hostKey !== undefined && card.zone === "battlefield" ? { ...card, attachedTo: hostKey } : card;
  });
  // Tokens off the battlefield are gone (rule 704.5d), and so is a card a
  // scenario can't name (an emblem has no card).
  const registry = registryOf();
  const kept = withAttachments.filter(
    (c) => registry.has(c.name) && (c.zone === "battlefield" || !isTokenCard(registry.get(c.name))),
  );
  const seats: ScenarioSeat[] = previous.seats.map((seat) => {
    const player = s.players[seat.player];
    const poison = player?.counters.poison ?? 0;
    return { player: seat.player, life: player?.life ?? seat.life, bot: seat.bot, ...(poison > 0 ? { poison } : {}) };
  });
  const active = s.turnOrder[s.turn.activePlayerIndex] ?? previous.active;
  const turn = Math.max(1, Math.min(MAX_TURN, s.turn.number));
  const spec: ScenarioSpec = {
    seats,
    cards: kept,
    active,
    step: scenarioStepOf(s.turn.step),
    ...(turn > 1 ? { turn } : {}),
    libraryFill: Math.max(0, fill),
  };
  return withoutUnholdableDamage(spec, registry);
}

/**
 * `spec` less any damage its built board can't hold. A game's damage is
 * never lethal once state-based actions have looked, but what kept it so can
 * be an effect a scenario leaves behind — Giant Growth on a Grizzly Bears
 * with 4 damage, both gone at cleanup (rule 514.2) — so on the rebuilt board
 * it would be. That damage goes the way of the effect.
 */
function withoutUnholdableDamage(spec: ScenarioSpec, registry: CardRegistry): ScenarioSpec {
  if (!spec.cards.some((c) => (c.damage ?? 0) > 0)) return spec;
  const laid = layOut(spec, registry);
  const drop = new Set(spec.cards.filter((c) => damageProblem(laid, c) !== null).map((c) => c.key));
  if (drop.size === 0) return spec;
  return {
    ...spec,
    cards: spec.cards.map((c) => {
      if (!drop.has(c.key)) return c;
      const { damage: _damage, ...rest } = c;
      return rest;
    }),
  };
}

/** What a builder session needs from the manager that owns its code. */
export interface BuilderHost {
  /** Puts `room` under the session's code, in place of the one before. */
  readonly install: (room: Room) => void;
  readonly onUpdate: (room: Room) => void;
  readonly capture?: CaptureConfig;
}

/**
 * One scenario builder room: the scenario, whether it's being built or
 * played, and the `Room` currently serving it — replaced on every rebuild,
 * with every connected human carried across into the same seat.
 */
export class BuilderSession {
  readonly id: string;
  private spec: ScenarioSpec = defaultScenario();
  private mode: "build" | "play" = "build";
  private current: Room;
  private readonly host: HostRole;
  private readonly env: BuilderHost;

  constructor(id: string, host: HostRole, env: BuilderHost) {
    this.id = id;
    this.host = host;
    this.env = env;
    this.current = this.makeRoom(buildScenario(this.spec), 0);
    this.env.install(this.current);
  }

  get room(): Room {
    return this.current;
  }

  /** Replaces the scenario being built. */
  update(spec: ScenarioSpec): void {
    if (this.mode !== "build") throw new Error("go back to building to change the board");
    const built = buildScenario(spec);
    this.spec = spec;
    this.swap(built);
  }

  /** Starts play from the scenario. */
  start(): void {
    if (this.mode !== "build") throw new Error("already playing");
    this.mode = "play";
    this.swap(buildScenario(this.spec));
  }

  /** Back to building the scenario play started from. */
  stop(): void {
    if (this.mode !== "play") throw new Error("not playing");
    this.mode = "build";
    this.swap(buildScenario(this.spec));
  }

  /** Back to building, from the game as it stands. */
  snapshot(): void {
    if (this.mode !== "play") throw new Error("not playing");
    const spec = snapshotScenario(this.current.game, this.spec);
    const built = buildScenario(spec);
    this.spec = spec;
    this.mode = "build";
    this.swap(built);
  }

  switchSeat(connection: Connection, seat: PlayerId): void {
    this.current.switchSeat(connection, seat);
  }

  private info(objects: Record<ObjectId, string>): BuilderInfo {
    return { mode: this.mode, spec: this.spec, objects: this.mode === "build" ? objects : {} };
  }

  private makeRoom(built: BuiltScenario, startSeq: number): Room {
    const room = new Room(this.id, built.game, {
      frozen: this.mode === "build",
      startSeq,
      host: this.host,
      onUpdate: this.env.onUpdate,
      botSpeed: "normal",
      ...(this.env.capture !== undefined ? { capture: this.env.capture } : {}),
    });
    room.builder = this.info(built.objects);
    return room;
  }

  private swap(built: BuiltScenario): void {
    const old = this.current;
    const claims = old.humanClaims();
    old.dispose();
    const room = this.makeRoom(built, old.frameSeq);
    const seats = new Set<string>(built.game.state.turnOrder);
    const taken = new Set<string>();
    for (const claim of claims) {
      if (claim.connection === null) continue;
      // A seat the scenario dropped: the developer moves to the first free one.
      const player = seats.has(claim.player) && !taken.has(claim.player)
        ? claim.player
        : built.game.state.turnOrder.find((p) => !taken.has(p));
      if (player === undefined) continue;
      taken.add(player);
      room.claimSeat(player, claim.clientToken, claim.connection, claim.displayName ?? undefined);
    }
    this.current = room;
    this.env.install(room);
    if (this.mode === "play") {
      for (const seat of this.spec.seats) {
        if (seat.bot && !taken.has(seat.player)) room.addBot(seat.player);
      }
    }
    room.start();
  }
}
