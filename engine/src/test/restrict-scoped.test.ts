/**
 * `restrict` over a filter, scoped (rule 611.2c): a turn-wide rule read from
 * a target player's side or a target's controller's (`controlledByTarget` —
 * Concussive Bolt, Mark for Death), leaving the target out (`exceptTarget`),
 * or fixed to the permanents matching it as it resolves (`asItResolves` —
 * Joraga Invocation, Suicidal Charge); and "can't be blocked this turn" as a
 * turn-wide rule over a name or every creature (Leitmotif Composer, Veiling
 * Oddity), binding a creature that arrives later.
 */
import { describe, expect, it } from "vitest";

import { restrictionsOf } from "../characteristics.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  activate,
  B,
  cast,
  type Table,
  lands,
  life,
  pt,
  ref,
  registryOf,
  spawn,
  table,
  toHand,
} from "./harness.js";

const bound = (t: Table, id: ObjectId): ReadonlySet<string> => restrictionsOf(t.game.state, registryOf(t.game), id);

describe("a turn-wide restriction over a target player's creatures", () => {
  it("Concussive Bolt with metalcraft: the target player's creatures can't block, a later one too", () => {
    const t = table();
    const { game } = t;
    for (let i = 0; i < 3; i++) spawn(game, "Ornithopter");
    const bear = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Concussive Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    expect(bound(t, bear).has("cant-block")).toBe(true);
    expect(bound(t, mine).has("cant-block")).toBe(false);
    const later = spawn(game, "Grizzly Bears", B);
    expect(bound(t, later).has("cant-block")).toBe(true);
  });

  it("aimed at a planeswalker, it binds that planeswalker's controller's creatures", () => {
    const t = table();
    const { game } = t;
    for (let i = 0; i < 3; i++) spawn(game, "Ornithopter");
    const liliana = spawn(game, "Liliana of the Veil", B);
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Concussive Bolt"), { targets: [ref(liliana)] });
    expect(bound(t, bear).has("cant-block")).toBe(true);
  });

  it("without metalcraft, only the damage", () => {
    const t = table();
    const { game } = t;
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Concussive Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    expect(bound(t, bear).has("cant-block")).toBe(false);
  });

  it("Mark for Death: the target must block and is untapped; the other creatures of its controller can't block", () => {
    const t = table();
    const { game } = t;
    const marked = spawn(game, "Grizzly Bears", B, { tapped: true });
    const other = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Mark for Death"), { targets: [ref(marked)] });
    expect(game.state.objects[marked].tapped).toBe(false);
    expect(bound(t, marked).has("cant-block")).toBe(false);
    expect(bound(t, other).has("cant-block")).toBe(true);
    expect(game.state.blockRequirements?.some((r) => r.blocker === marked)).toBe(true);
    const later = spawn(game, "Grizzly Bears", B);
    expect(bound(t, later).has("cant-block")).toBe(true);
  });
});

describe("a restriction fixed to the permanents there as it resolves", () => {
  it("Joraga Invocation: its creatures get +3/+3 and must be blocked; one arriving later doesn't", () => {
    const t = table();
    const { game } = t;
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Joraga Invocation"));
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 5 });
    expect(bound(t, bear).has("must-be-blocked-if-able")).toBe(true);
    const later = spawn(game, "Grizzly Bears");
    expect(bound(t, later).has("must-be-blocked-if-able")).toBe(false);
  });

  it("Suicidal Charge: the opponents' creatures get -1/-1 and must attack; one arriving later needn't", () => {
    const t = table();
    const { game } = t;
    const charge = spawn(game, "Suicidal Charge");
    const bear = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    activate(game, charge);
    expect(pt(game, bear)).toEqual({ power: 1, toughness: 1 });
    expect(bound(t, bear).has("must-attack")).toBe(true);
    expect(bound(t, mine).has("must-attack")).toBe(false);
    const later = spawn(game, "Grizzly Bears", B);
    expect(bound(t, later).has("must-attack")).toBe(false);
  });
});

describe("can't be blocked this turn, as a rule", () => {
  it("Leitmotif Composer: every creature with its name, whoever controls it, and one arriving later", () => {
    const t = table();
    const { game } = t;
    const composer = spawn(game, "Leitmotif Composer");
    const theirs = spawn(game, "Leitmotif Composer", B);
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Island", 3);
    activate(game, composer);
    expect(bound(t, composer).has("cant-be-blocked")).toBe(true);
    expect(bound(t, theirs).has("cant-be-blocked")).toBe(true);
    expect(bound(t, bear).has("cant-be-blocked")).toBe(false);
    const later = spawn(game, "Leitmotif Composer");
    expect(bound(t, later).has("cant-be-blocked")).toBe(true);
  });

  it("Veiling Oddity: as its last time counter comes off in exile, creatures can't be blocked that turn", () => {
    const t = table();
    const { game, a } = t;
    lands(game, "Island", 2);
    const oddity = toHand(game, "Veiling Oddity");
    game.dispatch({ type: "suspend", player: A, card: oddity });
    game.state.objects[oddity].counters.time = 1;
    a.chooseCastNowFn = () => null;
    const bear = spawn(game, "Grizzly Bears", B);
    expect(bound(t, bear).has("cant-be-blocked")).toBe(false);
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "draw");
    expect(bound(t, bear).has("cant-be-blocked")).toBe(true);
  });
});
