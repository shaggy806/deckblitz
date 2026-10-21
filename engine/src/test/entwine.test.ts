import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, hand, lands, pickFromZone, ref, spawn, table, toGraveyard, toHand, tokensNamed, zone } from "./harness.js";

// Entwine (rule 702.42): "You may choose all modes of this spell instead of
// just the number specified. If you do, you pay an additional [cost]" — a
// kicker whose cast chooses every mode (`castModal.kickedModes`), resolved
// in the order printed (702.42b).

const offers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card);

describe("entwine", () => {
  it("is offered as an entwine variant only when the extra cost can be paid", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const gravedig = toHand(game, "Gravedig");
    toGraveyard(game, "Grizzly Bears");
    expect(offers(game, gravedig).some((o) => o.kind === "cast-spell" && o.kicked === true)).toBe(false);
    lands(game, "Swamp", 2);
    const entwined = offers(game, gravedig).find((o) => o.kind === "cast-spell" && o.kicked === true);
    expect(entwined).toMatchObject({ kickerKeyword: "entwine", kickerCost: "{2}" });
    expect(entwined?.kind === "cast-spell" && entwined.castModal).toMatchObject({ minModes: 2, maxModes: 2 });
  });

  it("Gravedig entwined: both modes — the target player's Zombie and the card back", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const bears = toGraveyard(game, "Grizzly Bears");
    const gravedig = toHand(game, "Gravedig");
    cast(game, gravedig, { kicked: true, modes: [0, 1], targets: [ref(B), ref(bears)] });
    expect(tokensNamed(game, "Zombie Token", B)).toBe(1);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(0);
    expect(zone(game, bears)).toBe("hand");
  });

  it("Tooth and Nail entwined: searches first, then puts creatures from the hand onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Forest", 9);
    const tooth = toHand(game, "Tooth and Nail");
    const giant = game.debugSpawn("Hill Giant", A, "library");
    pickFromZone(a, giant);
    cast(game, tooth, { kicked: true, modes: [0, 1] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(hand(game).includes(tooth)).toBe(false);
  });

  it("an entwined spell isn't a kicked spell (Roost of Drakes)", () => {
    const { game } = table();
    spawn(game, "Roost of Drakes");
    lands(game, "Mountain", 7);
    const party = toHand(game, "Goblin War Party");
    cast(game, party, { kicked: true, modes: [0, 1] });
    expect(tokensNamed(game, "Goblin Token", A)).toBe(3);
    expect(tokensNamed(game, "Drake Token", A)).toBe(0);
  });
});
