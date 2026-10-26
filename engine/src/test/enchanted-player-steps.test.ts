/**
 * "At the beginning of enchanted player's upkeep / draw step / end step" — a
 * Curse's `step-begins` trigger with `who: "attached"`: it fires only in the
 * steps of the player the Aura is attached to (rule 303.4), and "that player"
 * is then the active player.
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, graveyard, hand, lands, life, named, pickFromZone, ref, settle, spawn, table, toGraveyard, toHand, toLibrary, toStep, zone, controller } from "./harness.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

const curse = (game: Game, name: string, at: PlayerId = B): void => {
  lands(game, "Swamp", 4);
  lands(game, "Island", 4);
  lands(game, "Mountain", 2);
  cast(game, toHand(game, name), { targets: [ref(at)] });
};

describe("enchanted player's steps", () => {
  it("Curse of the Bloody Tome mills the enchanted player in their upkeep only", () => {
    const { game } = table();
    curse(game, "Curse of the Bloody Tome");
    expect(named(game, "Curse of the Bloody Tome")).toHaveLength(1);
    toStep(game, "upkeep", B);
    settle(game);
    expect(graveyard(game, B)).toHaveLength(2);
    toStep(game, "upkeep", A);
    settle(game);
    expect(graveyard(game, A).filter((id) => game.state.objects[id].cardName === "Wastes")).toHaveLength(0);
    expect(graveyard(game, B)).toHaveLength(2);
  });

  it("Curse of Oblivion has the enchanted player exile two cards of their choice from their graveyard", () => {
    const { game, b } = table();
    const [x, y, z] = ["Grizzly Bears", "Shock", "Divination"].map((n) => toGraveyard(game, n, B));
    curse(game, "Curse of Oblivion");
    const seen = pickFromZone(b, x, z);
    toStep(game, "upkeep", B);
    settle(game);
    expect(seen.offered).toEqual(expect.arrayContaining([x, y, z]));
    expect([zone(game, x), zone(game, y), zone(game, z)]).toEqual(["exile", "graveyard", "exile"]);
  });

  it("Curse of Obsession: two more cards in the enchanted player's draw step, their hand discarded at their end step", () => {
    const { game } = table();
    curse(game, "Curse of Obsession");
    const before = hand(game, B).length;
    toStep(game, "draw", B);
    settle(game);
    expect(hand(game, B).length).toBe(before + 3);
    toStep(game, "end", B);
    settle(game);
    expect(hand(game, B)).toHaveLength(0);
  });

  it("Curse of Unbinding puts the enchanted player's first creature onto the battlefield under the Curse's controller", () => {
    const { game } = table();
    curse(game, "Curse of Unbinding");
    const bears = toLibrary(game, "Grizzly Bears", B);
    const shock = toLibrary(game, "Shock", B);
    toStep(game, "upkeep", B);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(zone(game, shock)).toBe("graveyard");
  });

  it("Cruel Reality: a creature sacrificed, or 5 life lost when there is none", () => {
    const { game } = table();
    curse(game, "Cruel Reality");
    const bears = spawn(game, "Grizzly Bears", B);
    toStep(game, "upkeep", B);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    toStep(game, "upkeep", B);
    settle(game);
    expect(life(game, B)).toBe(15);
  });

  it("Torment of Scarabs: the enchanted player chooses, and may always take the 3 life loss", () => {
    const { game, b } = table();
    curse(game, "Torment of Scarabs");
    spawn(game, "Grizzly Bears", B);
    toHand(game, "Shock", B);
    let offered: readonly string[] = [];
    b.chooseModesFn = (_view, _min, _max, texts) => {
      offered = texts;
      return [];
    };
    toStep(game, "upkeep", B);
    settle(game);
    expect(offered).toEqual(["Sacrifice a nonland permanent", "Discard a card"]);
    expect(life(game, B)).toBe(17);
  });
});
