/**
 * "You may cast target creature card in a graveyard this turn. When you cast
 * it this turn, this creature gains all activated abilities of that card until
 * end of turn" (Havengul Lich — the need key
 * `static:gain-activated-abilities-of-card`): a one-card permission's
 * `whenCast`, a delayed triggered ability of the effect that gave it (rule
 * 603.7) that finds the spell only when it's cast this way (400.7h), on the
 * stack above it (the ruling), its `"source"` the permanent that gave it.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  D,
  activate,
  cast,
  lands,
  life,
  named,
  nextTurn,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const granted = (game: Game, id: ObjectId) => game.state.objects[id].modifiers.flatMap((m) => m.grantsActivated ?? []);

describe("Havengul Lich", () => {
  it("casts a creature card from an opponent's graveyard, and gains its activated abilities as it's cast", () => {
    const { game } = table();
    const lich = spawn(game, "Havengul Lich");
    lands(game, "Island", 4);
    const sorcerer = toGraveyard(game, "Prodigal Sorcerer", B);
    activate(game, lich, 0, { targets: [ref(sorcerer)] });
    expect(granted(game, lich)).toHaveLength(0);
    // Cast with its ordinary costs (the ruling); the trigger above it
    // resolves first.
    cast(game, sorcerer, { via: "graveyard-permission", settle: false });
    const stack = game.state.zones.shared.stack;
    expect(stack).toHaveLength(2);
    settle(game);
    expect(zone(game, sorcerer)).toBe("battlefield");
    expect(game.state.objects[sorcerer].controller).toBe(A);
    expect(granted(game, lich)).toHaveLength(1);
    // The Lich pings with it.
    activate(game, lich, 1, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    // Until end of turn only.
    nextTurn(game);
    nextTurn(game);
    expect(granted(game, lich)).toHaveLength(0);
  });

  it("gains nothing when the card isn't cast", () => {
    const { game } = table();
    const lich = spawn(game, "Havengul Lich");
    lands(game, "Island", 1);
    const sorcerer = toGraveyard(game, "Prodigal Sorcerer");
    activate(game, lich, 0, { targets: [ref(sorcerer)] });
    expect(game.state.delayedTriggers).toHaveLength(0);
    nextTurn(game);
    nextTurn(game);
    // The permission is gone with the turn.
    lands(game, "Island", 3);
    expect(() => cast(game, sorcerer, { via: "graveyard-permission" })).toThrow();
    expect(granted(game, lich)).toHaveLength(0);
  });

  it("a card cast some other way isn't the one it waits for (400.7h)", () => {
    const { game } = table();
    const lich = spawn(game, "Havengul Lich");
    lands(game, "Island", 1);
    const sorcerer = toGraveyard(game, "Prodigal Sorcerer");
    activate(game, lich, 0, { targets: [ref(sorcerer)] });
    // Another creature spell, from hand: no trigger.
    lands(game, "Forest", 1);
    cast(game, game.debugSpawn("Llanowar Elves", A, "hand"));
    expect(granted(game, lich)).toHaveLength(0);
    expect(named(game, "Llanowar Elves")).toHaveLength(1);
  });

  it("a Lich gone from the battlefield gains nothing, but the card can still be cast", () => {
    const { game } = table();
    const lich = spawn(game, "Havengul Lich");
    lands(game, "Island", 4);
    const sorcerer = toGraveyard(game, "Prodigal Sorcerer");
    activate(game, lich, 0, { targets: [ref(sorcerer)] });
    game.debugMove(lich, "graveyard");
    settle(game);
    cast(game, sorcerer, { via: "graveyard-permission" });
    expect(zone(game, sorcerer)).toBe("battlefield");
    expect(granted(game, lich)).toHaveLength(0);
  });
});

/**
 * The Ruinous Powers: the same `whenCast` on an impulse permission over an
 * opponent's library top, lasting until end of turn — "when you cast a spell
 * this way, its owner loses life equal to its mana value", read on the stack.
 */
describe("The Ruinous Powers", () => {
  /** To alice's next upkeep, with `top` (bob's) on top of bob's library and
   * the upkeep trigger resolved. */
  function upkeepWith(game: Game, top: string): ObjectId {
    nextTurn(game); // bob's turn: he has drawn already
    const card = toLibrary(game, top, B);
    toStep(game, "upkeep");
    settle(game);
    return card;
  }

  it("exiles bob's top card; cast this way, with any colour of mana, bob loses life equal to its mana value", () => {
    const { game } = table();
    spawn(game, "The Ruinous Powers");
    lands(game, "Swamp", 1);
    const bolt = upkeepWith(game, "Lightning Bolt");
    expect(zone(game, bolt)).toBe("exile");
    // Black mana for a red spell (spend as though any colour).
    cast(game, bolt, { via: "impulse", targets: [ref(B)], settle: false });
    expect(game.state.zones.shared.stack).toHaveLength(2);
    settle(game);
    expect(life(game, B)).toBe(20 - 3 - 1);
    expect(life(game, A)).toBe(20);
  });

  it("an X spell's mana value counts its X, read on the stack", () => {
    const { game } = table();
    spawn(game, "The Ruinous Powers");
    lands(game, "Swamp", 4);
    const blaze = upkeepWith(game, "Blaze");
    toStep(game, "precombat-main");
    cast(game, blaze,{ via: "impulse", x: 3, targets: [ref(B)] });
    expect(life(game, B)).toBe(20 - 3 - 4);
  });

  it("a land played this way isn't cast: nobody loses life", () => {
    const { game } = table();
    spawn(game, "The Ruinous Powers");
    const land = upkeepWith(game, "Mountain");
    toStep(game, "precombat-main");
    game.dispatch({ type: "play-land", player: A, card: land });
    settle(game);
    expect(zone(game, land)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });

  it("the permission ends with the turn", () => {
    const { game } = table();
    spawn(game, "The Ruinous Powers");
    lands(game, "Swamp", 1);
    const bolt = upkeepWith(game, "Lightning Bolt");
    const castable = () => game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === bolt);
    expect(castable()).toBe(true);
    nextTurn(game);
    game.advanceUntil((s) => s.priority.holder === A);
    expect(zone(game, bolt)).toBe("exile");
    expect(castable()).toBe(false);
  });

  it("at more players, the card comes from one of the opponents, and that owner loses the life", () => {
    const { game } = table({ players: 4 });
    spawn(game, "The Ruinous Powers");
    lands(game, "Swamp", 2);
    nextTurn(game);
    nextTurn(game);
    nextTurn(game); // dave's turn: everyone has drawn
    const tops = [B, C, D].map((p) => toLibrary(game, "Shock", p));
    toStep(game, "upkeep");
    settle(game);
    const exiled = tops.filter((id) => zone(game, id) === "exile");
    expect(exiled).toHaveLength(1);
    const owner = game.state.objects[exiled[0]].owner;
    cast(game, exiled[0], { via: "impulse", targets: [ref(owner)] });
    expect(life(game, owner)).toBe(20 - 2 - 1);
  });
});
