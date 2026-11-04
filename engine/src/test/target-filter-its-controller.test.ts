/**
 * A target filter's number read against the matched object's own controller
 * (`forItsController`): Drown in the Loch's "with mana value less than or equal
 * to the number of cards in its controller's graveyard", on the spell or the
 * creature, read when it's targeted and again as it resolves (rule 608.2b).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, C, cast, lands, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const LOCH = "Drown in the Loch";
const COUNTER = 0;
const DESTROY = 1;

const graveyard = (game: Game, player: PlayerId, n: number): void => {
  for (let i = 0; i < n; i += 1) toGraveyard(game, "Wastes", player);
};

describe("Drown in the Loch's destroy", () => {
  it("reads the creature's controller's graveyard, not the caster's", () => {
    const { game } = table({ players: 3 });
    const short = spawn(game, "Grizzly Bears", B); // mana value 2
    const enough = spawn(game, "Grizzly Bears", C);
    graveyard(game, A, 5);
    graveyard(game, B, 1);
    graveyard(game, C, 2);
    lands(game, "Underground Sea", 2);
    expect(() => cast(game, toHand(game, LOCH), { modes: [DESTROY], targets: [ref(short)] })).toThrow();
    cast(game, toHand(game, LOCH), { modes: [DESTROY], targets: [ref(enough)] });
    expect(zone(game, enough)).toBe("graveyard");
    expect(zone(game, short)).toBe("battlefield");
  });

  it("reads its controller's when that isn't its owner", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].controller = A;
    graveyard(game, B, 5);
    lands(game, "Underground Sea", 2);
    expect(() => cast(game, toHand(game, LOCH), { modes: [DESTROY], targets: [ref(bears)] })).toThrow();
    graveyard(game, A, 2);
    cast(game, toHand(game, LOCH), { modes: [DESTROY], targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("is rechecked on resolution: the graveyard shrinking leaves it no legal target", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const gone = toGraveyard(game, "Wastes", B);
    toGraveyard(game, "Wastes", B);
    lands(game, "Underground Sea", 2);
    cast(game, toHand(game, LOCH), { modes: [DESTROY], targets: [ref(bears)], settle: false });
    game.debugMove(gone, "exile");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Drown in the Loch's counter", () => {
  it("counters a spell whose mana value its controller's graveyard reaches", () => {
    const { game } = table();
    graveyard(game, A, 2);
    lands(game, "Forest", 2);
    lands(game, "Underground Sea", 2, B);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, toHand(game, LOCH, B), { player: B, modes: [COUNTER], targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("can't target a spell past its controller's graveyard, whatever the caster's holds", () => {
    const { game } = table();
    graveyard(game, A, 1);
    graveyard(game, B, 9);
    lands(game, "Forest", 2);
    lands(game, "Underground Sea", 2, B);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    expect(() => cast(game, toHand(game, LOCH, B), { player: B, modes: [COUNTER], targets: [ref(bears)] })).toThrow(/target/);
    graveyard(game, A, 1);
    cast(game, toHand(game, LOCH, B), { player: B, modes: [COUNTER], targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("counts the {X} chosen for a spell in its mana value (its ruling)", () => {
    const { game } = table();
    graveyard(game, A, 3);
    lands(game, "Mountain", 4);
    lands(game, "Underground Sea", 2, B);
    const blaze = toHand(game, "Blaze");
    cast(game, blaze, { x: 3, targets: [ref(B)], settle: false }); // mana value 4
    game.dispatch({ type: "pass-priority", player: A });
    expect(() => cast(game, toHand(game, LOCH, B), { player: B, modes: [COUNTER], targets: [ref(blaze)] })).toThrow(/target/);
    graveyard(game, A, 1);
    cast(game, toHand(game, LOCH, B), { player: B, modes: [COUNTER], targets: [ref(blaze)] });
    expect(zone(game, blaze)).toBe("graveyard");
  });
});
