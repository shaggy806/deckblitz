/**
 * A card name chosen and used by what follows: as a spell resolves (Cabal
 * Therapy's discard of every card with that name, Predict's draw read off
 * the milled card), and as a permanent enters together with a player —
 * Booby Trap's "the chosen player reveals each card they draw" (the
 * `revealsDraws` static) and its `draws` trigger on "a card with the chosen
 * name" (the trigger's filter reading the permanent's chosen name).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, hand, graveyard, lands, life, ref, settle, table, toHand, toLibrary, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

const draw = (game: Game, player: PlayerId, n = 1): void => {
  game.debugApplyEffect(player, { kind: "draw", amount: n });
  settle(game);
};

describe("Cabal Therapy: every card with the chosen name discarded", () => {
  it("discards all copies of the name and nothing else", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const bolts = [toHand(game, "Lightning Bolt", B), toHand(game, "Lightning Bolt", B)];
    const bears = toHand(game, "Grizzly Bears", B);
    let offered: readonly string[] = [];
    a.chooseCardNameFn = (_view, _source, options) => {
      offered = options;
      return "Lightning Bolt";
    };
    cast(game, toHand(game, "Cabal Therapy"), { targets: [ref(B)] });
    for (const id of bolts) expect(zone(game, id)).toBe("graveyard");
    expect(zone(game, bears)).toBe("hand");
    // A nonland card name.
    expect(offered).not.toContain("Forest");
    expect(offered).toContain("Lightning Bolt");
  });
});

describe("Predict: the chosen name against the milled card", () => {
  it("draws two when the milled card has the chosen name", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    toLibrary(game, "Hill Giant", B);
    a.chooseCardNameFn = () => "Hill Giant";
    const before = hand(game, A).length;
    cast(game, toHand(game, "Predict"), { targets: [ref(B)] });
    expect(graveyard(game, B)).toHaveLength(1);
    expect(hand(game, A).length).toBe(before + 2);
  });

  it("draws one when it doesn't", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    toLibrary(game, "Hill Giant", B);
    a.chooseCardNameFn = () => "Grizzly Bears";
    const before = hand(game, A).length;
    cast(game, toHand(game, "Predict"), { targets: [ref(B)] });
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("Booby Trap: the chosen player's draws revealed, and the named card sprung", () => {
  const trap = (): { game: Game; trap: ObjectId } => {
    const { game, a } = table();
    a.chooseCardNameFn = () => "Hill Giant";
    lands(game, "Wastes", 6);
    const id = toHand(game, "Booby Trap");
    cast(game, id);
    return { game, trap: id };
  };

  it("keeps the opponent and the name chosen as it enters", () => {
    const { game, trap: id } = trap();
    expect(game.state.objects[id].chosenPlayer).toBe(B);
    expect(game.state.objects[id].chosenNames).toEqual(["Hill Giant"]);
  });

  it("reveals each card the chosen player draws", () => {
    const { game } = trap();
    const bears = toLibrary(game, "Grizzly Bears", B);
    draw(game, B);
    expect(game.eventsOfType("cards-revealed").some((e) => e.player === B && e.objects.includes(bears))).toBe(true);
    // Not the trap's controller's draws.
    const giant = toLibrary(game, "Hill Giant", A);
    draw(game, A);
    expect(game.eventsOfType("cards-revealed").some((e) => e.objects.includes(giant))).toBe(false);
  });

  it("is sacrificed and deals 10 to the player who drew the named card", () => {
    const { game, trap: id } = trap();
    toLibrary(game, "Hill Giant", B);
    draw(game, B);
    expect(zone(game, id)).toBe("graveyard");
    expect(life(game, B)).toBe(10);
  });

  it("ignores other names, and other players drawing the name", () => {
    const { game, trap: id } = trap();
    toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Hill Giant", A);
    draw(game, B);
    draw(game, A);
    expect(zone(game, id)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(20);
  });

  it("can't be named a basic land", () => {
    const { game, a } = table();
    let offered: readonly string[] = [];
    a.chooseCardNameFn = (_view, _source, options) => {
      offered = options;
      return "Hill Giant";
    };
    lands(game, "Wastes", 6);
    cast(game, toHand(game, "Booby Trap"));
    expect(offered).not.toContain("Forest");
    expect(offered).toContain("Hill Giant");
  });
});
