/**
 * "Put the cards exiled with this into their owners' graveyards" (rule 607.2a):
 * `return-exiled-by-source`'s `linked: "graveyard"`, together, what it exiled
 * "until it leaves" (610.3) included, counted after by `thisWay:
 * "put-into-graveyard"`. Valakut Exploration, Pinnacle Starcage, Gravegouger.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, activate, cast, destroy, enter, graveyard, lands, life, nextTurn, ref, settle, spawn, table, tokensNamed, toGraveyard, toHand, toLibrary, toStep, zone } from "./harness.js";

/** Top of the library, first to last. */
function stack(game: Game, ...names: readonly string[]): ObjectId[] {
  return [...names].reverse().map((name) => toLibrary(game, name)).reverse();
}

describe("Valakut Exploration", () => {
  it("exiles the top card on landfall, playable while it stays exiled; a card left is put away for damage", () => {
    const { game } = table({ deck: "Wastes" });
    spawn(game, "Valakut Exploration");
    const [bolt, stone] = stack(game, "Lightning Bolt", "Mind Stone");
    enter(game, "Mountain");
    enter(game, "Mountain");
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, stone)).toBe("exile");

    // Played from exile, it's gone: only the other is counted.
    cast(game, stone, { via: "impulse" });
    expect(zone(game, stone)).toBe("battlefield");

    toStep(game, "end");
    settle(game);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
    // Yours alone took none.
    expect(life(game, A)).toBe(20);
  });

  it("deals no damage and doesn't trigger with nothing exiled with it", () => {
    const { game } = table();
    spawn(game, "Valakut Exploration");
    toStep(game, "end");
    expect(game.state.zones.shared.stack).toHaveLength(0);
    settle(game);
    expect(life(game, B)).toBe(20);
  });

  it("a card played in response to the end-step trigger is neither moved nor counted", () => {
    const { game } = table({ step: "precombat-main" });
    spawn(game, "Valakut Exploration");
    const [elf, bolt] = stack(game, "Llanowar Elves", "Lightning Bolt");
    enter(game, "Mountain");
    enter(game, "Mountain");
    const victim = spawn(game, "Grizzly Bears", B);
    toStep(game, "end");
    expect(game.state.zones.shared.stack).toHaveLength(1);
    cast(game, bolt, { targets: [ref(victim)], via: "impulse", settle: false });
    settle(game);
    expect(zone(game, elf)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("every card still exiled goes, across turns; each opponent takes it in a 4-player game", () => {
    const { game, players } = table({ players: 4 });
    spawn(game, "Valakut Exploration");
    const [a, b] = stack(game, "Hill Giant", "Hill Giant");
    enter(game, "Plains");
    enter(game, "Plains");
    toStep(game, "end");
    settle(game);
    expect(zone(game, a)).toBe("graveyard");
    expect(zone(game, b)).toBe("graveyard");
    for (const player of players) expect(life(game, player)).toBe(player === A ? 20 : 18);
  });

  it("gone before the end step: no trigger, and the exiled cards stay playable", () => {
    const { game } = table();
    const valakut = spawn(game, "Valakut Exploration");
    const [stone] = stack(game, "Mind Stone");
    enter(game, "Mountain");
    enter(game, "Mountain");
    enter(game, "Mountain");
    destroy(game, valakut);
    toStep(game, "end");
    settle(game);
    expect(zone(game, stone)).toBe("exile");
    expect(life(game, B)).toBe(20);
    nextTurn(game);
    nextTurn(game);
    cast(game, stone, { via: "impulse" });
    expect(zone(game, stone)).toBe("battlefield");
  });

  it("gone in response to the end-step trigger: the linked cards still go, and it still deals the damage", () => {
    const { game } = table();
    const valakut = spawn(game, "Valakut Exploration");
    const [giant] = stack(game, "Hill Giant");
    enter(game, "Mountain");
    toStep(game, "end");
    expect(game.state.zones.shared.stack).toHaveLength(1);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [{ kind: "object", object: valakut }]);
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
  });
});

describe("Pinnacle Starcage", () => {
  it("exiles artifacts and creatures of mana value 2 or less until it leaves, and brings them back", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const ring = spawn(game, "Sol Ring");
    const giant = spawn(game, "Hill Giant", B);
    const starcage = toHand(game, "Pinnacle Starcage");
    cast(game, starcage);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, ring)).toBe("exile");
    expect(zone(game, giant)).toBe("battlefield");
    destroy(game, starcage);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, ring)).toBe("battlefield");
  });

  it("puts each exiled card into its owner's graveyard, a Robot for each, and is sacrificed with nothing to return", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const ring = spawn(game, "Sol Ring");
    const starcage = toHand(game, "Pinnacle Starcage");
    cast(game, starcage);
    lands(game, "Plains", 8);
    activate(game, starcage, 0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(bears);
    expect(zone(game, ring)).toBe("graveyard");
    expect(tokensNamed(game, "Robot Token", A)).toBe(2);
    expect(zone(game, starcage)).toBe("graveyard");
  });
});

describe("Gravegouger", () => {
  it("returns the two cards it exiled to their owner's graveyard when it leaves", () => {
    const { game, a } = table();
    const first = toGraveyard(game, "Grizzly Bears", B);
    const second = toGraveyard(game, "Hill Giant", B);
    const third = toGraveyard(game, "Llanowar Elves", B);
    a.chooseTargetsFn = () => [ref(first), ref(second)];
    const gouger = enter(game, "Gravegouger");
    expect(zone(game, first)).toBe("exile");
    expect(zone(game, second)).toBe("exile");
    expect(zone(game, third)).toBe("graveyard");
    destroy(game, gouger);
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, second)).toBe("graveyard");
    expect(graveyard(game, B)).toEqual(expect.arrayContaining([first, second, third]));
  });
});
