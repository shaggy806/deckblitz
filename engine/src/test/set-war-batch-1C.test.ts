/**
 * War of the Spark, group C: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import { restrictionsOf } from "../characteristics.js";
import { whyCannotBlock } from "../combat/eligibility.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Pledge of Unity", () => {
  it("puts a counter on each creature you control and gains 1 life for each", () => {
    const { game } = table();
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Pledge of Unity"));
    for (const b of bears) expect(counters(game, b)).toBe(1);
    expect(counters(game, theirs)).toBe(0);
    expect(life(game)).toBe(22);
  });
});

describe("Finale of Eternity", () => {
  it("offers only creatures with toughness X or less", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const ogre = spawn(game, "Turret Ogre", B);
    lands(game, "Swamp", 4);
    const finale = toHand(game, "Finale of Eternity");
    const at = (target: ObjectId): Action => ({ type: "cast-spell", player: A, card: finale, targets: [ref(target)], xValue: 2 });
    expect(game.canDispatch(at(ogre))).not.toBeNull();
    cast(game, finale, { x: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, ogre)).toBe("battlefield");
  });

  it("with X of 10, returns every creature card from your graveyard, the destroyed ones too", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const dead = toGraveyard(game, "Turret Ogre");
    lands(game, "Swamp", 12);
    cast(game, toHand(game, "Finale of Eternity"), { x: 10, targets: [ref(mine)] });
    expect(game.state.objects[mine]).toBeDefined();
    expect(game.battlefield.some((id) => game.state.objects[id].cardName === "Grizzly Bears")).toBe(true);
    expect(zone(game, dead)).toBe("battlefield");
  });
});

describe("Jace, Arcane Strategist", () => {
  it("the second draw of a turn puts a counter on target creature you control", () => {
    const { game, a } = table();
    spawn(game, "Jace, Arcane Strategist");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    // Turn 1's draw step has already happened: this is the second draw.
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.awaiting === null);
    expect(counters(game, bears)).toBe(1);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.awaiting === null);
    expect(counters(game, bears)).toBe(1);
  });

  it("−7: creatures you control can't be blocked this turn", () => {
    const { game, a } = table();
    const jace = spawn(game, "Jace, Arcane Strategist");
    const bears = spawn(game, "Grizzly Bears");
    loyalty(game, jace, -7, { atLeast: 7, settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(restrictionsOf(game.state, game.registry, bears).has("cant-be-blocked")).toBe(true);
    // A rule for the turn (rule 611.2c): a creature arriving later is covered too.
    const later = spawn(game, "Hill Giant");
    expect(restrictionsOf(game.state, game.registry, later).has("cant-be-blocked")).toBe(true);
    const blocker = spawn(game, "Hill Giant", B);
    expect(restrictionsOf(game.state, game.registry, blocker).has("cant-be-blocked")).toBe(false);
    // And it stops a block: once they attack, the Giant may block neither.
    a.declareAttackersFn = () => [bears, later].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-blockers" || s.awaiting?.kind === "blockers");
    expect(game.state.objects[bears].attacking).toBe(B);
    expect(whyCannotBlock(game.state, game.registry, B, blocker, bears)).toMatch(/can't be blocked/);
    expect(whyCannotBlock(game.state, game.registry, B, blocker, later)).toMatch(/can't be blocked/);
  });
});

describe("Arlinn, Voice of the Pack", () => {
  it("−2: the Wolf enters with an additional +1/+1 counter", () => {
    const { game } = table();
    const arlinn = spawn(game, "Arlinn, Voice of the Pack");
    loyalty(game, arlinn, -2);
    const wolf = game.battlefield.find((id) => game.state.objects[id].cardName === "Wolf Token")!;
    expect(pt(game, wolf)).toEqual({ power: 3, toughness: 3 });
    const bears = spawn(game, "Grizzly Bears");
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Living Twister", () => {
  it("{G}: returns a tapped land you control, chosen as it resolves", () => {
    const { game, a } = table();
    const twister = spawn(game, "Living Twister");
    spawn(game, "Forest"); // pays {G}, and is tapped by then
    const untapped = spawn(game, "Wastes");
    const tapped = spawn(game, "Wastes", A, { tapped: true });
    const seen = pickPermanents(a, tapped);
    activate(game, twister, 1);
    expect(seen.offered).toContain(tapped);
    expect(seen.offered).not.toContain(untapped);
    expect(zone(game, tapped)).toBe("hand");
    expect(zone(game, untapped)).toBe("battlefield");
  });
});

describe("The Elderspell", () => {
  it("puts two loyalty counters on your chosen planeswalker for each one destroyed", () => {
    const { game, a } = table();
    const mine = spawn(game, "Jace, Arcane Strategist");
    const theirs = [spawn(game, "Arlinn, Voice of the Pack", B), spawn(game, "Jace, Arcane Strategist", B)];
    lands(game, "Swamp", 2);
    pickPermanents(a, mine);
    cast(game, toHand(game, "The Elderspell"), { targets: theirs.map(ref) });
    for (const t of theirs) expect(zone(game, t)).toBe("graveyard");
    expect(counters(game, mine, "loyalty")).toBe(8);
  });
});

describe("Honor the God-Pharaoh", () => {
  it("discards as a cost, draws two and amasses 1", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const honor = toHand(game, "Honor the God-Pharaoh");
    const before = hand(game).length;
    cast(game, honor);
    expect(hand(game).length).toBe(before - 2 + 2);
    const army = game.battlefield.find((id) => game.state.objects[id].cardName === "Army Token")!;
    expect(pt(game, army)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Jace's Projection", () => {
  it("{3}{U}: a loyalty counter on target Jace planeswalker", () => {
    const { game } = table();
    const projection = spawn(game, "Jace's Projection");
    const jace = spawn(game, "Jace, Arcane Strategist");
    lands(game, "Island", 4);
    activate(game, projection, 0, { targets: [ref(jace)] });
    expect(counters(game, jace, "loyalty")).toBe(5);
  });
});

describe("Dreadhorde Twins", () => {
  it("its Army is a Zombie token with trample", () => {
    const { game } = table();
    const twins = enter(game, "Dreadhorde Twins");
    const army = game.battlefield.find((id) => game.state.objects[id].cardName === "Army Token")!;
    expect(pt(game, army)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, army).has("trample")).toBe(true);
    expect(keywords(game, twins).has("trample")).toBe(false);
  });
});

describe("Jace's Triumph", () => {
  it("draws three with a Jace, two without", () => {
    const { game } = table();
    lands(game, "Island", 6);
    let before = hand(game).length;
    cast(game, toHand(game, "Jace's Triumph"));
    expect(hand(game).length).toBe(before + 2);
    spawn(game, "Jace, Arcane Strategist");
    before = hand(game).length;
    cast(game, toHand(game, "Jace's Triumph"));
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("Topple the Statue", () => {
  it("taps a creature without destroying it, destroys an artifact, and draws either way", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    let before = hand(game).length;
    cast(game, toHand(game, "Topple the Statue"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game).length).toBe(before + 1);
    const thopter = spawn(game, "Ornithopter", B);
    before = hand(game).length;
    cast(game, toHand(game, "Topple the Statue"), { targets: [ref(thopter)] });
    expect(zone(game, thopter)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Jace's Ruse", () => {
  it("bounces up to two creatures and may find Jace in the graveyard", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const bears = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    const jace = toGraveyard(game, "Jace, Arcane Strategist");
    pickModes(a, 0);
    // Searching the library too, finding is a choice (rule 701.23b).
    pickFromZone(a, jace);
    cast(game, toHand(game, "Jace's Ruse"), { targets: bears.map(ref) });
    for (const b of bears) expect(zone(game, b)).toBe("hand");
    expect(zone(game, jace)).toBe("hand");
  });
});

describe("Heartfire", () => {
  it("can sacrifice a planeswalker as its cost", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const jace = spawn(game, "Jace, Arcane Strategist");
    cast(game, toHand(game, "Heartfire"), { sacrifice: jace, targets: [ref(B)] });
    expect(zone(game, jace)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
  });
});

describe("Forced Landing", () => {
  it("targets only a creature with flying", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const thopter = spawn(game, "Ornithopter", B);
    const landing = toHand(game, "Forced Landing");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: landing, targets: [ref(bears)] })).not.toBeNull();
    cast(game, landing, { targets: [ref(thopter)] });
    expect(zone(game, thopter)).toBe("library");
  });
});

describe("Turret Ogre", () => {
  it("deals 2 to each opponent only beside another creature with power 4 or greater", () => {
    const { game } = table();
    enter(game, "Turret Ogre");
    expect(life(game, B)).toBe(20);
    enter(game, "Turret Ogre");
    expect(life(game, B)).toBe(18);
  });
});

describe("Devouring Hellion", () => {
  it("devours creatures and planeswalkers: two counters for each", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const jace = spawn(game, "Jace, Arcane Strategist");
    lands(game, "Mountain", 3);
    const seen = pickPermanents(a, bears, jace);
    const hellion = toHand(game, "Devouring Hellion");
    cast(game, hellion);
    expect(seen.offered).toEqual(expect.arrayContaining([bears, jace]));
    expect(graveyard(game)).toEqual(expect.arrayContaining([bears, jace]));
    expect(counters(game, hellion)).toBe(4);
  });
});

describe("Rubblebelt Rioters", () => {
  it("attacking, gets +X/+0 for the greatest power among your creatures", () => {
    const { game, a } = table();
    const rioters = spawn(game, "Rubblebelt Rioters");
    spawn(game, "Turret Ogre");
    attack(game, a, [rioters]);
    expect(pt(game, rioters).power).toBe(4);
    expect(life(game, B)).toBe(16);
  });
});
