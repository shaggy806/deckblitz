/**
 * What the history log needs from an event to word its line: the source of an
 * ability that has left the stack, where a chosen card went, a lands-only
 * prohibition, and a public name for a copy that was cast.
 */
import { describe, expect, it } from "vitest";

import type { GameEvent } from "../events.js";
import type { Game } from "../game.js";
import { publicNameAt } from "../state.js";
import {
  A,
  B,
  activate,
  cast,
  enter,
  lands,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toExile,
  toHand,
} from "./harness.js";

const last = <T extends GameEvent["type"]>(game: Game, type: T): Extract<GameEvent, { type: T }> | undefined =>
  game.events.filter((e): e is Extract<GameEvent, { type: T }> => e.type === type).at(-1);

describe("events the log names things by", () => {
  it("a countered ability and its crime carry the ability's source", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const rod = spawn(game, "Rod of Ruin");
    activate(game, rod, 0, { targets: [ref(B)], settle: false });
    const ability = game.state.zones.shared.stack[0];
    expect(last(game, "crime-committed")).toMatchObject({ object: ability, source: rod });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(ability)]);
    settle(game);
    expect(last(game, "spell-countered")).toMatchObject({ object: ability, ability: true, source: rod });
  });

  it("a spell's crime has no source: the spell is named itself", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(last(game, "crime-committed")?.source).toBeUndefined();
  });

  it("a processor's card put into a graveyard says so", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const theirs = toExile(game, "Hill Giant", B);
    pickModes(a, 0);
    pickTargets(a, bears);
    pickFromZone(a, theirs);
    enter(game, "Wasteland Strangler");
    expect(last(game, "cards-chosen-from-zone")).toMatchObject({ objects: [theirs], to: "graveyard" });
  });

  it("a lands-only prohibition has an event", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Turf Wound"), { targets: [ref(B)] });
    expect(last(game, "prohibition-imposed")).toMatchObject({ players: [B], lands: true });
  });

  it("a copy that is cast is publicly named from its cast on", () => {
    const { game, a } = table();
    lands(game, "Wastes", 6);
    const bolt = toHand(game, "Lightning Bolt");
    pickFromZone(a, bolt);
    cast(game, toHand(game, "Isochron Scepter"));
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0];
      return { type: "cast-spell", player: A, card: way.card, targets: [ref(B)], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    activate(game, named(game, "Isochron Scepter")[0]);
    const castCopy = game.events.filter((e) => e.type === "spell-cast").at(-1);
    expect(castCopy?.type).toBe("spell-cast");
    if (castCopy?.type !== "spell-cast") return;
    expect(game.state.objects[castCopy.object]).toBeUndefined();
    expect(publicNameAt(game.state.publicStints ?? {}, castCopy.object, castCopy.seq)).toBe("Lightning Bolt");
  });
});
