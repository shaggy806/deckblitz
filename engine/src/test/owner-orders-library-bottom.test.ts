/**
 * "Return two cards exiled with this Saga to the battlefield under their
 * owners' control and put the rest on the bottom of their owners' libraries."
 * (Vault 13: Dweller's Journey — need key decision:owner-orders-library-bottom):
 * no new decision. The Saga's controller chooses the two (`look-and-choose`
 * `zone: "exiled-with-source"`, `under: "owners"` — rule 610.3c), then
 * `put-on-libraries` of `{ exiledWithSource }` sends the rest at once, each
 * owner arranging their own (rule 401.4; the card's ruling: "the owner of
 * those cards chooses the order").
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, D, controller, enter, life, pickFromZone, pickTargets, ref, settle, spawn, table, watchTargets, zone } from "./harness.js";

/** One more lore counter on the Saga, its chapter ability resolved. */
function lore(game: Game, saga: ObjectId): void {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(saga)]);
  settle(game);
}

const library = (game: Game, player: PlayerId): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("Vault 13: Dweller's Journey", () => {
  it("I exiles up to one other enchantment or creature each player controls, yours included, until the Saga leaves", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Glorious Anthem", B);
    const forest = spawn(game, "Forest", B);
    // One slot a seat with something to target (a seat with nothing drops out).
    const seen = watchTargets(a, () => [mine, theirs]);
    const saga = enter(game, "Vault 13: Dweller's Journey");
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    // Not the Saga itself, nor a land.
    expect(seen.offered.flat()).not.toContain(saga);
    expect(seen.offered.flat()).not.toContain(forest);
    expect(seen.offered[0]).toContain(mine);
    expect(seen.offered[1]).toContain(theirs);
    lore(game, saga);
    lore(game, saga);
    // Returned or sent away by III; the Saga is sacrificed after it.
    expect(zone(game, saga)).toBe("graveyard");
  });

  it("II gains 2 life and scries 2", () => {
    const { game, a } = table();
    const saga = enter(game, "Vault 13: Dweller's Journey");
    const before = life(game);
    a.chooseFromZoneFn = () => [];
    lore(game, saga);
    expect(life(game)).toBe(before + 2);
  });

  it("III returns the two its controller chooses under their owners' control; each owner orders the rest on the bottom", () => {
    const { game, a, b } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    // Carol controls an Ogre Bob owns: two of the exiled cards are Bob's.
    const ogre = spawn(game, "Gray Ogre", B);
    game.debugApplyEffect(C, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(ogre)]);
    const elves = spawn(game, "Llanowar Elves", C);
    pickTargets(a, bears, giant, ogre);
    const saga = enter(game, "Vault 13: Dweller's Journey");
    expect([bears, giant, ogre].map((id) => zone(game, id))).toEqual(["exile", "exile", "exile"]);
    expect(zone(game, elves)).toBe("battlefield");
    lore(game, saga);
    // Alice chooses her Bears and one of Bob's two; the other goes alone, so
    // Bob has no order to choose.
    const chosen = pickFromZone(a, bears, ogre);
    const ordered = pickFromZone(b, giant);
    lore(game, saga);
    expect([...chosen.offered].sort()).toEqual([bears, giant, ogre].sort());
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, ogre)).toBe("battlefield");
    // Under its owner's control (rule 610.3c), not Carol's.
    expect(controller(game, ogre)).toBe(B);
    expect(library(game, B).at(-1)).toBe(giant);
    expect(ordered.offered).toEqual([]);
  });

  it("III with two of one owner's cards left: that owner arranges them", () => {
    const { game, a, b } = table({ players: 4 });
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const ogre = spawn(game, "Gray Ogre", B);
    game.debugApplyEffect(C, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(ogre)]);
    const elves = spawn(game, "Llanowar Elves", D);
    pickTargets(a, bears, giant, ogre, elves);
    const saga = enter(game, "Vault 13: Dweller's Journey");
    lore(game, saga);
    // Alice returns her Bears and the Elves; Bob's two go to his library's
    // bottom in the order he picks.
    pickFromZone(a, bears, elves);
    const ordered = pickFromZone(b, ogre, giant);
    lore(game, saga);
    expect([...ordered.offered].sort()).toEqual([giant, ogre].sort());
    expect(library(game, B).slice(-2)).toEqual([ogre, giant]);
    expect(zone(game, elves)).toBe("battlefield");
  });

  it("III returns what there is when fewer than two are exiled", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    const saga = enter(game, "Vault 13: Dweller's Journey");
    lore(game, saga);
    pickFromZone(a, giant);
    lore(game, saga);
    expect(zone(game, giant)).toBe("battlefield");
    expect(controller(game, giant)).toBe(B);
  });
});
