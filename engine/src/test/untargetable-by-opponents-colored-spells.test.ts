/**
 * "Permanents you control can't be the targets of blue or black spells your
 * opponents control this turn" — a one-shot `prohibit` of `be-targeted`
 * (`by: "opponents"`, `only: "spells"`, a colour `sourceFilter`), a rules
 * change for the turn (rule 611.2c). Proven on Display of Dominance.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, cast, lands, nextTurn, pickModes, ref, spawn, table, toHand, zone } from "./harness.js";

/** Alice casts Display of Dominance's shield mode, then passes Bob priority. */
const shield = (game: Game, a: Parameters<typeof pickModes>[0]): void => {
  lands(game, "Forest", 2);
  pickModes(a, 1);
  cast(game, toHand(game, "Display of Dominance"), { modes: [1] });
  game.dispatch({ type: "pass-priority", player: A });
};

describe("Display of Dominance", () => {
  it("destroys a blue or black noncreature permanent", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const relic = spawn(game, "Jace's Erasure", B);
    pickModes(a, 0);
    cast(game, toHand(game, "Display of Dominance"), { modes: [0], targets: [ref(relic)] });
    expect(zone(game, relic)).toBe("graveyard");
  });

  it("can't destroy a creature or a permanent of another colour", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Display of Dominance");
    expect(() => cast(game, card, { modes: [0], targets: [ref(bears)] })).toThrow(/target/i);
  });

  it("stops an opponent's blue or black spell targeting your permanents", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    shield(game, a);
    lands(game, "Island", 1, B);
    lands(game, "Swamp", 2, B);
    expect(() => cast(game, toHand(game, "Unsummon", B), { player: B, targets: [ref(bears)] })).toThrow(/target/i);
    expect(() => cast(game, toHand(game, "Doom Blade", B), { player: B, targets: [ref(bears)] })).toThrow(/target/i);
  });

  it("makes a blue spell already aimed at your permanent lose its target (608.2b)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    lands(game, "Island", 1, B);
    const display = toHand(game, "Display of Dominance");
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, toHand(game, "Unsummon", B), { player: B, targets: [ref(bears)], settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    cast(game, display, { modes: [1] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.zones.shared.stack).toHaveLength(0);
  });

  it("reaches a permanent you start controlling after it resolved", () => {
    const { game, a } = table();
    shield(game, a);
    const later = spawn(game, "Llanowar Elves");
    lands(game, "Island", 1, B);
    expect(() => cast(game, toHand(game, "Unsummon", B), { player: B, targets: [ref(later)] })).toThrow(/target/i);
  });

  it("doesn't stop a red spell, or your own blue one", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    shield(game, a);
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    const elves = spawn(game, "Llanowar Elves");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Unsummon"), { targets: [ref(elves)] });
    expect(zone(game, elves)).toBe("hand");
  });

  it("ends with the turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    shield(game, a);
    nextTurn(game);
    lands(game, "Island", 1, B);
    cast(game, toHand(game, "Unsummon", B), { player: B, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
  });
});
