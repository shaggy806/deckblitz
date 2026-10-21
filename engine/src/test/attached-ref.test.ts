/**
 * "Enchanted creature" / "equipped creature" in an effect — the
 * `EffectTargetRef` `"attached"`: what the source is attached to as the
 * effect resolves, or, the source gone, what it was last attached to while
 * that is still the same object (rule 400.7). Theros Beyond Death's Auras and
 * Wings of Hubris (batch 118).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  enter,
  keywords,
  lands,
  nextTurn,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

/** Cast `aura` onto `host`, and stop with its enters trigger on the stack. */
function castToTrigger(game: Game, aura: ObjectId, host: ObjectId): void {
  cast(game, aura, { targets: [ref(host)], settle: false });
  game.advanceUntil(
    (s) => s.objects[aura]?.zone === "battlefield" && s.zones.shared.stack.length > 0 && s.awaiting === null,
  );
}

/** Take `id` off the battlefield without settling (a spell of bob's). */
function destroyNow(game: Game, id: ObjectId): void {
  game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(id)]);
}

describe("enchanted creature in an Aura's enters trigger", () => {
  it("Aspect of Manticore gives the creature it enchants first strike", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Aspect of Manticore"), { targets: [ref(bears)] });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });

  it("Starlit Mantle gone before its trigger resolves: the creature it last enchanted still gains hexproof", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    const mantle = toHand(game, "Starlit Mantle");
    castToTrigger(game, mantle, bears);
    destroyNow(game, mantle);
    settle(game);
    expect(zone(game, mantle)).toBe("graveyard");
    expect(keywords(game, bears).has("hexproof")).toBe(true);
  });

  it("a creature that left and came back is a new object: nothing gains anything", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    const aspect = toHand(game, "Aspect of Manticore");
    castToTrigger(game, aspect, bears);
    // The Aura leaves still enchanting the Bears, then the Bears are flickered:
    // back as a new object, no longer the creature it last enchanted.
    destroyNow(game, aspect);
    game.debugApplyEffect(A, { kind: "flicker", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(keywords(game, bears).has("first-strike")).toBe(false);
  });

  it("Warbriar Blessing: the enchanted creature fights the target", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant"); // 3/3, +0/+2 from the Blessing
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B); // two choices, so the target is asked
    lands(game, "Forest", 2);
    pickTargets(a, bears);
    cast(game, toHand(game, "Warbriar Blessing"), { targets: [ref(giant)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });
});

describe("an Aura's activated ability", () => {
  it("Dreadful Apathy exiles the creature it enchants", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 6);
    const apathy = toHand(game, "Dreadful Apathy");
    cast(game, apathy, { targets: [ref(bears)] });
    activate(game, apathy, 0);
    expect(zone(game, bears)).toBe("exile");
  });

  it("Dreadful Apathy destroyed in response: the creature it enchanted is still exiled", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 6);
    const apathy = toHand(game, "Dreadful Apathy");
    cast(game, apathy, { targets: [ref(bears)] });
    activate(game, apathy, 0, { settle: false });
    destroyNow(game, apathy);
    settle(game);
    expect(zone(game, apathy)).toBe("graveyard");
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("equipped creature in an Equipment's trigger", () => {
  it("Adventuring Gear: landfall pumps the creature it equips as the trigger resolves", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    const gear = spawn(game, "Adventuring Gear");
    activate(game, gear, 0, { targets: [ref(bears)] });
    enter(game, "Forest");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("a condition on the attached permanent, with the source gone", () => {
  it("Blade of the Bloodchief destroyed in response: its Vampire still gets two counters", () => {
    const { game } = table();
    const vampire = spawn(game, "Vampire Nighthawk");
    lands(game, "Wastes", 1);
    const blade = spawn(game, "Blade of the Bloodchief");
    activate(game, blade, 0, { targets: [ref(vampire)] });
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    game.advanceUntil((s) => s.zones.shared.stack.length > 0 || s.awaiting !== null);
    destroyNow(game, blade);
    settle(game);
    expect(zone(game, blade)).toBe("graveyard");
    expect(game.state.objects[vampire].counters["+1/+1"]).toBe(2);
  });

  it("Blade of the Bloodchief on a non-Vampire: one counter", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    const blade = spawn(game, "Blade of the Bloodchief");
    activate(game, blade, 0, { targets: [ref(bears)] });
    destroyNow(game, spawn(game, "Grizzly Bears", B));
    settle(game);
    expect(game.state.objects[bears].counters["+1/+1"]).toBe(1);
  });

  it("Ring of Xathrid: a counter at upkeep only on a black creature", () => {
    const { game } = table();
    const vampire = spawn(game, "Vampire Nighthawk");
    lands(game, "Wastes", 1);
    const ring = spawn(game, "Ring of Xathrid");
    activate(game, ring, 1, { targets: [ref(vampire)] });
    nextTurn(game, "upkeep");
    nextTurn(game, "upkeep");
    settle(game);
    expect(game.state.objects[vampire].counters["+1/+1"]).toBe(1);
  });

  it("Maze's Mantle: hexproof only for a creature with toxic", () => {
    const { game } = table();
    const rat = spawn(game, "Blightbelly Rat");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Maze's Mantle"), { targets: [ref(rat)] });
    cast(game, toHand(game, "Maze's Mantle"), { targets: [ref(bears)] });
    expect(keywords(game, rat).has("hexproof")).toBe(true);
    expect(keywords(game, bears).has("hexproof")).toBe(false);
  });

  it("Howl of the Hunt destroyed in response still untaps the Wolf it enchanted; a non-Wolf stays tapped", () => {
    const { game } = table();
    const wolf = spawn(game, "Bounding Wolf", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Forest", 6);
    const howl = toHand(game, "Howl of the Hunt");
    castToTrigger(game, howl, wolf);
    destroyNow(game, howl);
    settle(game);
    expect(game.state.objects[wolf].tapped).toBe(false);
    cast(game, toHand(game, "Howl of the Hunt"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("Maze's Mantle destroyed in response: its intervening if reads the creature it last enchanted (rule 603.4)", () => {
    const { game } = table();
    const rat = spawn(game, "Blightbelly Rat");
    lands(game, "Forest", 3);
    const mantle = toHand(game, "Maze's Mantle");
    castToTrigger(game, mantle, rat);
    destroyNow(game, mantle);
    settle(game);
    expect(zone(game, mantle)).toBe("graveyard");
    expect(keywords(game, rat).has("hexproof")).toBe(true);
  });
});

describe("equipped creature after the Equipment is sacrificed", () => {
  it("Wings of Hubris: the creature it equipped can't be blocked, and is sacrificed at the next end step", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    const wings = spawn(game, "Wings of Hubris");
    activate(game, wings, 1, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("flying")).toBe(true);
    activate(game, wings, 0);
    expect(zone(game, wings)).toBe("graveyard");
    expect(keywords(game, bears).has("unblockable")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});
