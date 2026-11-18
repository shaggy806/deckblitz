// Can a game be copied by its actions alone? The check behind rooms that run
// on the players' own devices (`docs/plans/replicated-rooms.md`): every device
// holds the game and is sent only what each player did, so the copies must
// come out the same, whoever applies the actions.
//
// `playWithReplicas` plays one game the way a room plays it — the game built
// with no controllers, taken on to its next decision (`advanceUntil(isSettled)`),
// the seat that owes the decision asked, its action dispatched — and keeps two
// copies of it that are given only the actions:
//
// - one built from the same seed and decks;
// - one restored from the game's state as it would be sent to another device
//   (`stateToJson` / `stateFromJson`), which a device joining late or taking
//   the host's state starts from; replaced with a fresh one every
//   `restoreEvery` actions, so the restore is tried at many points of a game.
//
// Every `compareEvery` actions, and at the end, each copy is compared with the
// game, whole state against whole state, and a difference throws with where
// it is. Where the states are the same their digests (`stateDigest`, what the
// devices of a copied room send each other) must be too, with the event log
// and without: a copy restored from a sent state has its objects' keys in
// another order, which the digest may not see.
//
// Played as a room and not through `Game`'s own controller loop because the
// two are not the same to the letter: the loop hands priority to whoever a
// decision waits on before asking them (a `priority-received` event a room's
// game never has), so a copy fed as a room feeds it drifts from a game the
// loop played by exactly those events. Every device of a copied room is fed
// the room's way, so that is the way to check.

import { Game, answeringPlayer, isSettled, standInFor, stateDigest, stateFromJson, stateToJson } from "../dist/index.js";

/** `value` with every object's keys in order and its `undefined` properties
 * gone, so two states with the same content read the same however they were
 * built. An `undefined` in an array stays (a blank target slot is one). */
function canonical(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => (v === undefined ? "(blank)" : canonical(v)));
  const out = {};
  for (const key of Object.keys(value).sort()) if (value[key] !== undefined) out[key] = canonical(value[key]);
  return out;
}

/** Where two canonical values first differ, a line each: `path: ours | theirs`. */
function differences(ours, theirs, path = "state", out = [], limit = 8) {
  if (out.length >= limit || ours === theirs) return out;
  const leaf = (v) => (v === undefined ? "(absent)" : (JSON.stringify(v) ?? String(v)).slice(0, 80));
  if (typeof ours !== "object" || typeof theirs !== "object" || ours === null || theirs === null) {
    out.push(`${path}: ${leaf(ours)} | ${leaf(theirs)}`);
    return out;
  }
  for (const key of new Set([...Object.keys(ours), ...Object.keys(theirs)])) {
    if (out.length >= limit) break;
    if (!(key in ours) || !(key in theirs)) out.push(`${path}.${key}: ${leaf(ours[key])} | ${leaf(theirs[key])}`);
    else differences(ours[key], theirs[key], `${path}.${key}`, out, limit);
  }
  return out;
}

/** The action the game is waiting for, from whoever answers it: the seat a
 * decision waits on or that holds priority, or the player making their
 * decisions for them (rule 723) — as `Game`'s own loop and a room's bots ask. */
function nextAction(game, controllers) {
  const state = game.state;
  const asked = state.awaiting !== null ? state.awaiting.player : state.priority.holder;
  const answering = answeringPlayer(state, asked);
  const view = game.controllerView(asked);
  const controller = controllers[answering];
  return answering === asked ? controller.act(view) : standInFor(controller, asked).act(view);
}

/**
 * Plays a game to its end, or until `stopAt(state)` says so at a decision,
 * with two copies kept and compared.
 *
 * - `create()`: a fresh game from the seed and decks, with no controllers
 *   (the game itself and the first copy are both made with it).
 * - `controllers`: who answers for each player.
 * - `onDecision(game, actions)`: called before each decision, for a heartbeat.
 * - `onAction(action, game, actions)`: called after each action is applied
 *   everywhere, the game at its next decision (what a recorder keeps).
 * - `wire`: how a state travels to another device, `{ encode, decode }`
 *   (the engine's `stateToJson` / `stateFromJson` unless given).
 *
 * Returns the game and how much was checked.
 */
export function playWithReplicas({
  create,
  controllers,
  stopAt = () => false,
  onDecision = () => {},
  onAction = () => {},
  compareEvery = 25,
  restoreEvery = 150,
  wire = { encode: stateToJson, decode: stateFromJson },
}) {
  const game = create();
  const seeded = create();
  let restored = null;
  let restoredAt = 0;
  let actions = 0;
  let compared = 0;
  let restores = 0;
  const digestMs = { whole: 0, brief: 0, states: 0 };
  const recent = [];

  const where = () => `turn ${game.state.turn.number} (${game.state.turn.step})`;
  const restoredLabel = () => `the copy restored from a sent state after ${restoredAt} actions`;

  /** One action into a copy, as a room applies it. */
  const apply = (copy, label, action) => {
    try {
      copy.dispatch(action);
      copy.advanceUntil(isSettled);
    } catch (error) {
      const stack = error instanceof Error ? (error.stack ?? error.message) : String(error);
      throw new Error(
        `replica check: ${label} threw on action ${actions + 1} (${JSON.stringify(action).slice(0, 160)}), ${where()}:\n${stack
          .split("\n")
          .slice(0, 6)
          .join("\n")}`,
      );
    }
  };

  const compare = (copy, label) => {
    const ours = canonical(game.snapshot());
    const theirs = canonical(copy.snapshot());
    if (JSON.stringify(ours) === JSON.stringify(theirs)) {
      const started = performance.now();
      const whole = stateDigest(game.state, { events: true });
      const middle = performance.now();
      const brief = stateDigest(game.state);
      digestMs.whole += middle - started;
      digestMs.brief += performance.now() - middle;
      digestMs.states += 1;
      if (whole !== stateDigest(copy.state, { events: true }) || brief !== stateDigest(copy.state)) {
        throw new Error(`replica check: ${label} is the same as the game after ${actions} actions, ${where()}, and its digest is not`);
      }
      return;
    }
    const lines = differences(ours, theirs).map((line) => `  ${line}`);
    // Where the two logs part, with what led up to it: usually the story.
    const a = ours.eventLog ?? [];
    const b = theirs.eventLog ?? [];
    let at = 0;
    while (at < a.length && at < b.length && JSON.stringify(a[at]) === JSON.stringify(b[at])) at += 1;
    if (at < Math.max(a.length, b.length)) {
      const show = (events, from, to) =>
        events.slice(Math.max(0, from), to).map((e) => `    ${JSON.stringify(e).slice(0, 200)}`);
      lines.push(`  the logs agree for ${at} events; the last of those:`, ...show(a, at - 3, at));
      lines.push("  then the game:", ...show(a, at, at + 4), "  and the copy:", ...show(b, at, at + 4));
    }
    throw new Error(
      `replica check: ${label} differs from the game after ${actions} actions, ${where()} (the game | the copy):\n${lines.join("\n")}\n  the last actions: ${recent.join(" ; ")}`,
    );
  };

  const compareAll = () => {
    compare(seeded, "the copy built from the seed");
    if (restored !== null) compare(restored, restoredLabel());
    compared += 1;
  };

  game.advanceUntil(isSettled);
  seeded.advanceUntil(isSettled);
  compareAll();
  while (!game.state.result.over && !stopAt(game.state)) {
    onDecision(game, actions);
    const action = nextAction(game, controllers);
    game.dispatch(action);
    game.advanceUntil(isSettled);
    apply(seeded, "the copy built from the seed", action);
    if (restored !== null) apply(restored, restoredLabel(), action);
    actions += 1;
    onAction(action, game, actions);
    recent.push(JSON.stringify(action).slice(0, 160));
    if (recent.length > 3) recent.shift();
    if (actions % compareEvery === 0) compareAll();
    if (actions % restoreEvery === 0) {
      // The outgoing one checked first, whatever the compare interval.
      if (restored !== null) compare(restored, restoredLabel());
      restored = Game.fromSnapshot(wire.decode(wire.encode(game.snapshot())));
      restoredAt = actions;
      restores += 1;
      // What it starts from is the game, to the letter.
      compare(restored, restoredLabel());
    }
  }
  compareAll();
  return { game, copied: { actions, compared, restores, digestMs } };
}
