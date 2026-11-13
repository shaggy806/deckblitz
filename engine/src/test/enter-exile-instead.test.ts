/**
 * Another permanent's "exile it instead" for a permanent about to enter (rule
 * 614.6, `OthersEnterReplacement.exileInstead`): Containment Priest's "if a
 * nontoken creature would enter and it wasn't cast, exile it instead", judged
 * as the creature would exist on the battlefield (rule 614.12), and ordered
 * against the entering permanent's own "as this enters" actions (616.1e).
 *
 * The Priest is spawned last in each board: a permanent `spawn` puts onto the
 * battlefield wasn't cast, so it would be exiled too.
 */

import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import type { Game } from "../game.js";
import {
  A,
  B,
  cast,
  counters,
  lands,
  pickFromZone,
  pickPermanents,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const give = (game: Game, id: ObjectId, kinds: Record<string, number>): void => {
  game.state.objects[id].counters = { ...game.state.objects[id].counters, ...kinds };
};

const priest = (game: Game): ObjectId => spawn(game, "Containment Priest", B);

/** Answers the order question with the option keyed `key`, noting each asked. */
function ordering(seat: ScriptedController, key: string): string[][] {
  const asked: string[][] = [];
  seat.chooseReplacementOrderFn = (_view, offer) => {
    asked.push(offer.options.map((o) => o.name));
    return Math.max(0, offer.options.findIndex((o) => o.key === key));
  };
  return asked;
}

describe("Containment Priest: a nontoken creature that wasn't cast is exiled instead", () => {
  it("a creature cast enters as usual", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    priest(game);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("a creature card reanimated is exiled instead", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    priest(game);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    pickFromZone(a, bears);
    cast(game, toHand(game, "Exhume"));
    expect(zone(game, bears)).toBe("exile");
  });

  it("a creature put onto the battlefield by an effect is exiled: spawned after it", () => {
    const { game } = table();
    priest(game);
    const bears = spawn(game, "Grizzly Bears");
    expect(zone(game, bears)).toBe("exile");
  });

  it("a flickered creature stays in exile", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    priest(game);
    cast(game, toHand(game, "Cloudshift"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
  });

  it("tokens enter as usual", () => {
    const { game } = table();
    priest(game);
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 2 }, []);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
  });

  it("a noncreature card entering as a creature is exiled (March of the Machines)", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const ring = spawn(game, "Sol Ring");
    spawn(game, "March of the Machines", B);
    priest(game);
    cast(game, toHand(game, "Cloudshift"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("exile");
  });

  it("a creature card entering as a noncreature isn't (a God short of devotion)", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    priest(game);
    const heliod = toGraveyard(game, "Heliod, Sun-Crowned", A);
    pickFromZone(a, heliod);
    cast(game, toHand(game, "Exhume"));
    expect(zone(game, heliod)).toBe("battlefield");
  });

  it("an entering permanent's own 'as this enters' actions are ordered against it: its own first", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const theirs = spawn(game, "Grizzly Bears", B);
    give(game, theirs, { "+1/+1": 2 });
    priest(game);
    const sin = toGraveyard(game, "Sin, Unending Cataclysm", A);
    const asked = ordering(a, "own");
    pickFromZone(a, sin);
    pickPermanents(a, theirs);
    cast(game, toHand(game, "Exhume"));
    expect(asked).toEqual([["Containment Priest", "Sin, Unending Cataclysm"]]);
    expect(counters(game, theirs)).toBe(0);
    expect(zone(game, sin)).toBe("exile");
  });

  it("… or the exile first, and none of them happen", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const theirs = spawn(game, "Grizzly Bears", B);
    give(game, theirs, { "+1/+1": 2 });
    priest(game);
    const sin = toGraveyard(game, "Sin, Unending Cataclysm", A);
    ordering(a, "exile");
    pickFromZone(a, sin);
    const seen = pickPermanents(a, theirs);
    cast(game, toHand(game, "Exhume"));
    expect(seen.offered).toEqual([]);
    expect(counters(game, theirs)).toBe(2);
    expect(zone(game, sin)).toBe("exile");
  });

  it("doesn't exile itself entering uncast", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const priestCard = toGraveyard(game, "Containment Priest", A);
    pickFromZone(a, priestCard);
    cast(game, toHand(game, "Exhume"));
    expect(zone(game, priestCard)).toBe("battlefield");
  });
});
