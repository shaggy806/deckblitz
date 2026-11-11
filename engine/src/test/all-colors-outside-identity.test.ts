/**
 * "Fallaji Wayfarer is all colors. This ability doesn't affect its color
 * identity": a characteristic-defining ability (rule 604.3) that works in
 * every zone, kept out of the card's colour identity (rule 903.4) by
 * `CardDefinition.colorsOutsideIdentity`. And its "multicolored spells you
 * cast have convoke" (`grantsToSpells` over `multicolored`).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { matchesFilter } from "../filter.js";
import type { Game } from "../game.js";
import { colorIdentityOf, identityString, withinIdentity } from "../identity.js";
import type { ObjectId } from "../primitives.js";

import { A, B, cast, registryOf, spawn, table, toHand, toLibrary, zone } from "./harness.js";

const castsOf = (game: Game, card: ObjectId): Extract<LegalAction, { kind: "cast-spell" }>[] =>
  game.legalActions(A).filter((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card);

const multicolored = (game: Game, id: ObjectId): boolean =>
  matchesFilter(game.state, registryOf(game), id, { multicolored: true }, { you: A, source: id });

describe("Fallaji Wayfarer's colours", () => {
  it("has a green colour identity, though it's all colours", () => {
    const { game } = table();
    const def = registryOf(game).get("Fallaji Wayfarer");
    expect(def.colors).toHaveLength(5);
    expect(identityString(colorIdentityOf(def, registryOf(game)))).toBe("G");
    expect(withinIdentity(colorIdentityOf(def, registryOf(game)), new Set(["G"]))).toBe(true);
  });

  it("leaves another all-colours card's identity as it was (Transguild Courier)", () => {
    const { game } = table();
    expect(identityString(colorIdentityOf(registryOf(game).get("Transguild Courier"), registryOf(game)))).toBe("WUBRG");
  });

  it("is multicolored in every zone", () => {
    const { game } = table();
    expect(multicolored(game, toLibrary(game, "Fallaji Wayfarer"))).toBe(true);
    expect(multicolored(game, toHand(game, "Fallaji Wayfarer"))).toBe(true);
    expect(multicolored(game, spawn(game, "Fallaji Wayfarer"))).toBe(true);
  });
});

describe("Fallaji Wayfarer's convoke", () => {
  it("gives multicolored spells convoke, itself paying for any colour", () => {
    const { game } = table();
    const wayfarer = spawn(game, "Fallaji Wayfarer");
    const piker = spawn(game, "Goblin Piker");
    const victim = spawn(game, "Grizzly Bears", B);
    const terminate = toHand(game, "Terminate");
    const [offer] = castsOf(game, terminate);
    expect(offer?.convoke?.candidates).toEqual(expect.arrayContaining([wayfarer, piker]));
    cast(game, terminate, {
      targets: [{ kind: "object", object: victim }],
      convoke: [
        { creature: wayfarer, pays: "B" },
        { creature: piker, pays: "R" },
      ],
    });
    expect(zone(game, victim)).toBe("graveyard");
    expect(game.state.objects[wayfarer].tapped).toBe(true);
  });

  it("gives a monocolored spell nothing", () => {
    const { game } = table();
    spawn(game, "Fallaji Wayfarer");
    spawn(game, "Goblin Piker");
    spawn(game, "Grizzly Bears", B);
    expect(castsOf(game, toHand(game, "Doom Blade"))).toEqual([]);
  });

  it("gives its own second copy convoke: the card is multicolored in hand", () => {
    const { game } = table();
    const first = spawn(game, "Fallaji Wayfarer");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const second = toHand(game, "Fallaji Wayfarer");
    cast(game, second, { convoke: [first, ...bears].map((creature) => ({ creature })) });
    expect(zone(game, second)).toBe("battlefield");
  });
});
