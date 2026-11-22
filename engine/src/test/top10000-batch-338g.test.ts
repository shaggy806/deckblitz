/**
 * B338g (author-top-cards overnight, lane replacements-copies).
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  destroy,
  hand,
  lands,
  pickFromZone,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const on = (game: Game, id: ObjectId): ObjectId | null => game.state.objects[id].attachedTo ?? null;

describe("Storm Herald: Auras returned, exiled at your end step or if they'd leave", () => {
  it("returns only the Auras chosen, each onto a creature you control", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const rancor = toGraveyard(game, "Rancor");
    const pacifism = toGraveyard(game, "Pacifism");
    const theirs = spawn(game, "Hill Giant", B);
    const seen = pickFromZone(a, rancor);
    let hosts: readonly unknown[] = [];
    a.chooseEnchantFn = (_view, _source, options) => {
      hosts = options;
      return options.find((o) => o === bears) ?? options[0];
    };
    cast(game, toHand(game, "Storm Herald"));
    settle(game);
    expect(seen.offered).toEqual(expect.arrayContaining([rancor, pacifism]));
    expect(hosts).toContain(bears);
    expect(hosts).not.toContain(theirs);
    expect(on(game, rancor)).toBe(bears);
    expect(zone(game, pacifism)).toBe("graveyard");
  });

  it("an Aura that would go to the graveyard is exiled instead (Rancor never returns to hand)", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    spawn(game, "Grizzly Bears");
    const rancor = toGraveyard(game, "Rancor");
    pickFromZone(a, rancor);
    cast(game, toHand(game, "Storm Herald"));
    settle(game);
    expect(zone(game, rancor)).toBe("battlefield");
    destroy(game, rancor);
    expect(zone(game, rancor)).toBe("exile");
    expect(hand(game)).not.toContain(rancor);
  });

  it("exiles those Auras at the beginning of your next end step", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const rancor = toGraveyard(game, "Rancor");
    pickFromZone(a, rancor);
    cast(game, toHand(game, "Storm Herald"));
    settle(game);
    expect(on(game, rancor)).not.toBeNull();
    toStep(game, "end", A);
    settle(game);
    expect(zone(game, rancor)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
  });
});
