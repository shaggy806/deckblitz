/**
 * Ixalan and Commander 2017, group A: raid, explore and enrage payoffs, the
 * Bishops, Mathas's bounty and Boneyard Scourge's graveyard return.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
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
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("Raging Swordtooth", () => {
  it("deals 1 damage to each other creature, both sides", () => {
    const { game } = table();
    const mine = spawn(game, "Llanowar Elves");
    const theirs = spawn(game, "Llanowar Elves", B);
    const sword = enter(game, "Raging Swordtooth");
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, sword)).toBe("battlefield");
    expect(game.state.objects[sword].damageMarked).toBe(0);
  });
});

describe("Fathom Fleet Captain", () => {
  it("with another nontoken Pirate, paying {2} makes a Pirate token", () => {
    const { game, a } = table();
    const captain = spawn(game, "Fathom Fleet Captain");
    spawn(game, "Headstrong Brute");
    lands(game, "Swamp", 2);
    pickModes(a, 0);
    attack(game, a, [captain]);
    expect(tokensNamed(game, "Pirate Token", A)).toBe(1);
  });

  it("without another nontoken Pirate it doesn't trigger", () => {
    const { game, a } = table();
    const captain = spawn(game, "Fathom Fleet Captain");
    lands(game, "Swamp", 2);
    pickModes(a, 0);
    attack(game, a, [captain]);
    expect(tokensNamed(game, "Pirate Token", A)).toBe(0);
  });
});

describe("Commune with Dinosaurs", () => {
  it("offers a Dinosaur or a land among the top five", () => {
    const { game, a } = table();
    toLibrary(game, "Wastes");
    const bears = toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    const dino = toLibrary(game, "Raging Swordtooth");
    // The first choice is the card to keep; the next orders the rest on the bottom.
    const seen = { offered: [] as readonly string[] };
    a.chooseFromZoneFn = (_view, eligible) => {
      if (seen.offered.length > 0) return eligible;
      seen.offered = eligible;
      return [dino];
    };
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Commune with Dinosaurs"));
    expect(seen.offered).toContain(dino);
    expect(seen.offered).toContain(forest);
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, dino)).toBe("hand");
  });
});

describe("Bishop of Rebirth", () => {
  it("returns a creature card with mana value 3 or less as it attacks, and not a bigger one", () => {
    const { game, a } = table();
    const bishop = spawn(game, "Bishop of Rebirth");
    const bears = toGraveyard(game, "Grizzly Bears");
    const big = toGraveyard(game, "Raging Swordtooth");
    const seen = watchTargets(a, () => [bears]);
    attack(game, a, [bishop]);
    expect(seen.offered[0]).not.toContain(big);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Wildgrowth Walker", () => {
  it("a creature you control exploring gives it a counter and you 3 life", () => {
    const { game } = table();
    const walker = spawn(game, "Wildgrowth Walker");
    toLibrary(game, "Forest");
    enter(game, "Merfolk Branchwalker");
    expect(counters(game, walker)).toBe(1);
    expect(life(game)).toBe(23);
  });
});

describe("Deadeye Plunderers", () => {
  it("gets +1/+1 for each artifact you control", () => {
    const { game } = table();
    const plunderers = spawn(game, "Deadeye Plunderers");
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    expect(pt(game, plunderers)).toEqual({ power: 3, toughness: 3 });
    activate(game, plunderers, 0);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(pt(game, plunderers)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Bishop of the Bloodstained", () => {
  it("counts every Vampire you control, itself included", () => {
    const { game, a } = table();
    spawn(game, "Bishop of Rebirth");
    spawn(game, "Grizzly Bears");
    pickTargets(a, B);
    enter(game, "Bishop of the Bloodstained");
    expect(life(game, B)).toBe(18);
  });
});

describe("Ruin Raider", () => {
  it("having attacked, puts the top card into your hand and you lose its mana value", () => {
    const { game, a } = table();
    const raider = spawn(game, "Ruin Raider");
    const bears = toLibrary(game, "Grizzly Bears");
    attack(game, a, [raider]);
    toStep(game, "end");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.awaiting === null);
    expect(zone(game, bears)).toBe("hand");
    expect(life(game)).toBe(18);
  });

  it("does nothing on a turn you didn't attack", () => {
    const { game } = table();
    spawn(game, "Ruin Raider");
    const bears = toLibrary(game, "Grizzly Bears");
    toStep(game, "end");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.awaiting === null);
    expect(zone(game, bears)).toBe("library");
    expect(life(game)).toBe(20);
  });
});

describe("Old-Growth Dryads", () => {
  it("each opponent may fetch a basic land onto the battlefield tapped", () => {
    const { game, b } = table();
    const forest = toLibrary(game, "Forest", B);
    pickModes(b, 0);
    pickFromZone(b, forest);
    enter(game, "Old-Growth Dryads");
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].controller).toBe(B);
    expect(game.state.objects[forest].tapped).toBe(true);
  });
});

describe("Shipwreck Looter", () => {
  it("loots only if you attacked this turn", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const before = graveyard(game).length;
    enter(game, "Shipwreck Looter");
    expect(graveyard(game).length).toBe(before);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    const handBefore = hand(game).length;
    enter(game, "Shipwreck Looter");
    expect(graveyard(game).length).toBe(before + 1);
    expect(hand(game).length).toBe(handBefore);
  });
});

describe("Vampire's Zeal", () => {
  it("gives first strike only to a Vampire", () => {
    const { game } = table();
    const vampire = spawn(game, "Bishop of Rebirth");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Vampire's Zeal"), { targets: [ref(vampire)] });
    cast(game, toHand(game, "Vampire's Zeal"), { targets: [ref(bears)] });
    expect(keywords(game, vampire).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Headstrong Brute", () => {
  it("has menace only beside another Pirate", () => {
    const { game } = table();
    const brute = spawn(game, "Headstrong Brute");
    expect(keywords(game, brute).has("menace")).toBe(false);
    spawn(game, "Shipwreck Looter");
    expect(keywords(game, brute).has("menace")).toBe(true);
  });
});

describe("Huatli's Spurring", () => {
  it("gives +2/+0 without a Huatli", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Huatli's Spurring"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Tilonalli's Knight", () => {
  it("gets +1/+1 attacking while you control a Dinosaur", () => {
    const { game, a } = table();
    const knight = spawn(game, "Tilonalli's Knight");
    spawn(game, "Raging Swordtooth");
    attack(game, a, [knight]);
    expect(pt(game, knight)).toEqual({ power: 3, toughness: 3 });
  });

  it("doesn't without one", () => {
    const { game, a } = table();
    const knight = spawn(game, "Tilonalli's Knight");
    attack(game, a, [knight]);
    expect(pt(game, knight)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Mathas, Fiend Seeker", () => {
  it("the bountied creature dying makes each of its controller's opponents draw and gain 2 life", () => {
    const { game, a } = table();
    spawn(game, "Mathas, Fiend Seeker");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    toStep(game, "end");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.awaiting === null);
    expect(counters(game, bears, "bounty")).toBe(1);
    const handA = hand(game).length;
    const handB = hand(game, B).length;
    destroy(game, bears, A);
    expect(hand(game).length).toBe(handA + 1);
    expect(life(game)).toBe(22);
    expect(hand(game, B).length).toBe(handB);
    expect(life(game, B)).toBe(20);
  });
});

describe("Boneyard Scourge", () => {
  it("returns from the graveyard for {1}{B} when a Dragon you control dies", () => {
    const { game, a } = table();
    const scourge = toGraveyard(game, "Boneyard Scourge");
    const dragon = spawn(game, "Shivan Dragon");
    lands(game, "Swamp", 2);
    pickModes(a, 0);
    destroy(game, dragon);
    expect(zone(game, scourge)).toBe("battlefield");
  });

  it("doesn't see its own death", () => {
    const { game, a } = table();
    const scourge = spawn(game, "Boneyard Scourge");
    lands(game, "Swamp", 2);
    pickModes(a, 0);
    destroy(game, scourge);
    expect(zone(game, scourge)).toBe("graveyard");
  });
});
