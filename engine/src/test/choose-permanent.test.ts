/**
 * Choosing permanents without targeting (the need-keys
 * `decision:choose-permanent` family): a permanent chosen as another enters
 * and kept on it (rule 614.1c — `choosePermanentOnEnter`), read back as "the
 * chosen creature" (rule 607.2d — the `"chosen"` ref and `{ scope: "chosen"
 * }`) while it's still that object (rule 400.7); a `choose-permanents` asked
 * of a player other than the effect's controller (`chooser`) for an amount
 * of permanents (`min` as an amount); and "another" sparing the trigger's
 * object (`exceptTriggerObject`, `sharesPermanentTypeWith`).
 */
import { describe, expect, it } from "vitest";

import { choosePermanents } from "../decisions/choose-permanents.js";
import type { ObjectId } from "../primitives.js";
import {
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  named,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("a permanent chosen as another enters", () => {
  it("Tyrannical Pitlord's chosen creature gets +3/+3 and flying, and is sacrificed when the Pitlord leaves", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    spawn(game, "Hill Giant", B);
    const seen = pickPermanents(a, lions);
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Tyrannical Pitlord"));
    expect([...seen.offered].sort()).toEqual([bear, lions].sort());
    const [pitlord] = named(game, "Tyrannical Pitlord");
    expect(game.state.objects[pitlord].chosenPermanent?.id).toBe(lions);
    expect(game.viewFor(B).objects[pitlord]?.chosen).toBe("Savannah Lions");
    expect(pt(game, lions)).toEqual({ power: 5, toughness: 4 });
    expect(keywords(game, lions).has("flying")).toBe(true);
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
    destroy(game, pitlord);
    settle(game);
    expect(zone(game, lions)).toBe("graveyard");
    expect(zone(game, bear)).toBe("battlefield");
  });

  it("a chosen creature that leaves and returns is a new object the Pitlord no longer names", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Tyrannical Pitlord"));
    const [pitlord] = named(game, "Tyrannical Pitlord");
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 5 });
    game.debugMove(bear, "exile");
    game.debugMove(bear, "battlefield");
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
    destroy(game, pitlord);
    settle(game);
    expect(zone(game, bear)).toBe("battlefield");
  });

  it("Dauntless Bodyguard takes the only other creature unasked, and saves it after it's sacrificed", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    let asked = false;
    a.choosePermanentsFn = (_view, eligible) => {
      asked = true;
      return eligible.slice(0, 1);
    };
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Dauntless Bodyguard"));
    expect(asked).toBe(false);
    const [guard] = named(game, "Dauntless Bodyguard");
    activate(game, guard, 0);
    expect(zone(game, guard)).toBe("graveyard");
    expect(keywords(game, bear).has("indestructible")).toBe(true);
    destroy(game, bear);
    settle(game);
    expect(zone(game, bear)).toBe("battlefield");
  });

  it("Grifter's Blade enters attached to the chosen creature, or unattached with none", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    pickPermanents(a, lions);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Grifter's Blade"));
    const [blade] = named(game, "Grifter's Blade");
    expect(game.state.objects[blade].attachedTo).toBe(lions);
    expect(pt(game, lions)).toEqual({ power: 3, toughness: 2 });

    const empty = table();
    lands(empty.game, "Plains", 3);
    cast(empty.game, toHand(empty.game, "Grifter's Blade"));
    const [alone] = named(empty.game, "Grifter's Blade");
    expect(zone(empty.game, alone)).toBe("battlefield");
    expect(empty.game.state.objects[alone].attachedTo).toBeNull();
  });

  it("Phylactery Lich puts its counter on the chosen artifact, and is sacrificed with no artifact", () => {
    const { game, a } = table();
    spawn(game, "Ornithopter");
    const ring = spawn(game, "Sol Ring");
    pickPermanents(a, ring);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Phylactery Lich"));
    const [lich] = named(game, "Phylactery Lich");
    expect(counters(game, ring, "phylactery")).toBe(1);
    expect(zone(game, lich)).toBe("battlefield");
    destroy(game, ring);
    settle(game);
    expect(zone(game, lich)).toBe("graveyard");

    const bare = table();
    lands(bare.game, "Swamp", 3);
    const alone = toHand(bare.game, "Phylactery Lich");
    cast(bare.game, alone);
    expect(graveyard(bare.game)).toContain(alone);
  });
});

describe("a choice made by another player", () => {
  it("Sunken Hope has the upkeep's player return one of their own creatures", () => {
    const { game, b } = table();
    spawn(game, "Sunken Hope");
    spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const lions = spawn(game, "Savannah Lions", B);
    const seen = pickPermanents(b, lions);
    toStep(game, "upkeep", B);
    settle(game);
    expect([...seen.offered].sort()).toEqual([giant, lions].sort());
    expect(hand(game, B)).toContain(lions);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("Tangle Wire has the upkeep's player tap one untapped permanent per fade counter, or all they have", () => {
    const { game, b } = table();
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Tangle Wire"));
    const [wire] = named(game, "Tangle Wire");
    expect(counters(game, wire, "fade")).toBe(4);
    const theirs = [...lands(game, "Wastes", 5, B), spawn(game, "Grizzly Bears", B)];
    let bounds: readonly number[] = [];
    b.choosePermanentsFn = (_view, eligible, min, max) => {
      bounds = [min, max];
      return eligible.slice(0, max);
    };
    toStep(game, "upkeep", B);
    settle(game);
    expect(bounds).toEqual([4, 4]);
    expect(theirs.filter((id) => game.state.objects[id].tapped).length).toBe(4);
  });

  it("Crashing Boars has the defending player choose the creature that must block it", () => {
    const { game, a, b } = table();
    const boars = spawn(game, "Crashing Boars");
    spawn(game, "Grizzly Bears", B, { tapped: true });
    const giant = spawn(game, "Hill Giant", B);
    const lions = spawn(game, "Savannah Lions", B);
    const seen = pickPermanents(b, lions);
    a.declareAttackersFn = () => [{ attacker: boars, defender: B }];
    game.advanceUntil((s) => (s.blockRequirements?.length ?? 0) > 0 || s.turn.step === "declare-blockers");
    expect([...seen.offered].sort()).toEqual([giant, lions].sort());
    expect(game.state.blockRequirements?.map((r) => [r.blocker, r.attacker])).toEqual([[lions, boars]]);
  });

  it("offers a forced pick's options one by one to the search, the least valuable first", () => {
    const { game, b } = table();
    spawn(game, "Sunken Hope");
    spawn(game, "Hill Giant", B);
    spawn(game, "Savannah Lions", B);
    b.choosePermanentsFn = (_view, eligible) => eligible.slice(0, 1);
    game.advanceUntil((s) => s.awaiting?.kind === "choose-permanents");
    const legal = game.legalActions(B).find((l) => l.kind === "choose-permanents");
    expect(legal).toBeDefined();
    const answers = choosePermanents.candidates!(legal!, B, 4, {
      order: (ids: readonly ObjectId[]) => [...ids],
      controllerOf: (id: ObjectId) => game.state.objects[id].controller,
    } as never);
    expect(answers.map((a) => (a.type === "choose-permanents" ? a.permanents.length : 0))).toEqual([1, 1]);
  });
});

describe("another, not the trigger's object", () => {
  it("Saw offers neither the attacker nor itself, and draws only for a sacrifice", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    const saw = spawn(game, "Saw");
    const pads = lands(game, "Wastes", 2);
    activate(game, saw, 0, { targets: [ref(bear)] });
    const seen = pickPermanents(a, lions);
    const before = hand(game).length;
    attack(game, a, [bear]);
    expect(seen.offered).not.toContain(bear);
    expect(seen.offered).not.toContain(saw);
    expect(seen.offered).toContain(lions);
    expect(seen.offered).toContain(pads[0]);
    expect(zone(game, lions)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });

  it("Cloudstone Curio offers only another permanent sharing a permanent type with the one that entered", () => {
    const { game, a } = table();
    const curio = spawn(game, "Cloudstone Curio");
    const bear = spawn(game, "Grizzly Bears");
    // An artifact creature shares "creature"; the lands and the Curio share
    // nothing with a creature.
    const thopter = spawn(game, "Ornithopter");
    lands(game, "Plains", 2);
    const seen = pickPermanents(a, bear);
    cast(game, toHand(game, "Savannah Lions"));
    expect([...seen.offered].sort()).toEqual([bear, thopter].sort());
    expect(seen.offered).not.toContain(curio);
    expect(hand(game)).toContain(bear);
  });
});
