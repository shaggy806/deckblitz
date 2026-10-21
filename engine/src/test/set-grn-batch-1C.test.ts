/**
 * Guilds of Ravnica, batch 1 group C — the clauses most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

describe("GRN batch 1C", () => {
  it("Ionize counters the spell and deals 2 damage to its controller", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Ionize"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(18);
  });

  it("Aurelia gives a red creature +2/+0 and trample, not vigilance", () => {
    const { game, a } = table();
    spawn(game, "Aurelia, Exemplar of Justice");
    const goblin = spawn(game, "Raging Goblin");
    pickTargets(a, goblin);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, goblin).power).toBe(3);
    expect(keywords(game, goblin).has("trample")).toBe(true);
    expect(keywords(game, goblin).has("vigilance")).toBe(false);
  });

  it("Glowspore Shaman mills three, then may put a land from the graveyard on top", () => {
    const { game, a } = table();
    const forest = toGraveyard(game, "Forest");
    pickFromZone(a, forest);
    enter(game, "Glowspore Shaman");
    expect(zone(game, forest)).toBe("library");
    expect(graveyard(game, A).length).toBe(3);
  });

  it("Justice Strike makes a creature deal damage to itself equal to its power", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Justice Strike"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Kraul Harpooner targets only a flyer you don't control and may fight it", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    const drake = spawn(game, "Wind Drake", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [drake]);
    pickModes(a, 0);
    enter(game, "Kraul Harpooner");
    expect(seen.offered[0]).toContain(drake);
    expect(seen.offered[0]).not.toContain(bears);
    expect(zone(game, drake)).toBe("graveyard");
  });

  it("Kraul Harpooner with no target just gets +X/+0", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    spawn(game, "Wind Drake", B);
    pickTargets(a, null);
    const harpooner = enter(game, "Kraul Harpooner");
    expect(pt(game, harpooner)).toEqual({ power: 5, toughness: 2 });
  });

  it("Rhizome Lurcher returned from the graveyard counts itself", () => {
    const { game } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    const lurcher = toGraveyard(game, "Rhizome Lurcher");
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0 }, [ref(lurcher)]);
    settle(game);
    expect(zone(game, lurcher)).toBe("battlefield");
    expect(counters(game, lurcher)).toBe(3);
  });

  it("Undercity Uprising still grants deathtouch when a fight target has gone", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 2);
    const lions = spawn(game, "Savannah Lions");
    const other = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Undercity Uprising"), { targets: [ref(lions), ref(giant)], settle: false });
    destroy(game, giant);
    expect(keywords(game, other).has("deathtouch")).toBe(true);
    expect(game.state.objects[lions].damageMarked).toBe(0);
  });

  it("Light of the Legion dying puts a counter on each white creature you control", () => {
    const { game } = table();
    const light = spawn(game, "Light of the Legion");
    const lions = spawn(game, "Savannah Lions");
    const bears = spawn(game, "Grizzly Bears");
    const theirLions = spawn(game, "Savannah Lions", B);
    destroy(game, light);
    expect(counters(game, lions)).toBe(1);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, theirLions)).toBe(0);
  });

  it("Portcullis Vine sacrifices a creature with defender to draw", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const vine = spawn(game, "Portcullis Vine");
    const wall = spawn(game, "Wall of Wood");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game, A).length;
    const base = { type: "activate-ability", player: A, source: vine, abilityIndex: 0, targets: [] } as const;
    expect(game.canDispatch({ ...base, sacrifice: bears })).not.toBeNull();
    game.dispatch({ ...base, sacrifice: wall });
    settle(game);
    expect(zone(game, wall)).toBe("graveyard");
    expect(zone(game, vine)).toBe("battlefield");
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Flower finds a basic Forest or Plains", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const card = toHand(game, "Flower // Flourish");
    const plains = game.debugSpawn("Plains", A, "library");
    const seen = pickFromZone(a, plains);
    cast(game, card, { face: 1 });
    expect(zone(game, plains)).toBe("hand");
    expect(seen.offered).toContain(plains);
  });
});
