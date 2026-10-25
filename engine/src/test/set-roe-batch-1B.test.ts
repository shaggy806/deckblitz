/**
 * Rise of the Eldrazi (ROE, B159) — group B.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
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
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Ancient Stirrings", () => {
  it("offers only colorless cards among the top five", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    const stirrings = toHand(game, "Ancient Stirrings");
    const before = hand(game).length;
    // The first choice is the card to keep; the next orders the rest.
    const seen = pickFromZone(a);
    let first = true;
    a.chooseFromZoneFn = (_view, eligible) => {
      if (!first) return eligible;
      first = false;
      seen.offered = eligible;
      return eligible.slice(0, 1);
    };
    cast(game, stirrings);
    expect(seen.offered.length).toBe(4);
    expect(seen.offered).not.toContain(bears);
    // The spell left the hand and one Wastes came in.
    expect(hand(game).length).toBe(before);
    expect(zone(game, bears)).toBe("library");
  });
});

describe("Mortician Beetle", () => {
  it("may take a +1/+1 counter when any player sacrifices a creature", () => {
    const { game, a } = table();
    const beetle = spawn(game, "Mortician Beetle");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    game.debugApplyEffect(B, { kind: "sacrifice-target", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, beetle)).toBe(1);
  });

  it("sees an edict's sacrifice", () => {
    const { game, a } = table();
    const beetle = spawn(game, "Mortician Beetle");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Diabolic Edict"), { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, beetle)).toBe(1);
  });
});

describe("Gravity Well", () => {
  it("an attacking flier loses flying until end of turn", () => {
    const { game, a } = table();
    spawn(game, "Gravity Well", B);
    const drake = spawn(game, "Wind Drake");
    a.declareAttackersFn = () => [{ attacker: drake, defender: B }];
    toStep(game, "declare-blockers");
    expect(keywords(game, drake).has("flying")).toBe(false);
    toStep(game, "precombat-main", B);
    expect(keywords(game, drake).has("flying")).toBe(true);
  });
});

describe("Sphinx-Bone Wand", () => {
  it("adds a charge counter, then deals damage equal to the counters", () => {
    const { game, a } = table();
    const wand = spawn(game, "Sphinx-Bone Wand");
    lands(game, "Mountain", 2);
    pickModes(a, 0);
    pickTargets(a, B);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(counters(game, wand, "charge")).toBe(1);
    expect(life(game, B)).toBe(17);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(counters(game, wand, "charge")).toBe(2);
    expect(life(game, B)).toBe(13);
  });

  it("declined: no counter and no damage", () => {
    const { game, a } = table();
    const wand = spawn(game, "Sphinx-Bone Wand");
    lands(game, "Mountain", 1);
    a.chooseModesFn = () => [];
    pickTargets(a, B);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(counters(game, wand, "charge")).toBe(0);
    expect(life(game, B)).toBe(18);
  });
});

describe("Surrakar Spellblade", () => {
  it("draws one card per charge counter on combat damage", () => {
    const { game, a } = table();
    const blade = spawn(game, "Surrakar Spellblade");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "charge", amount: 3 }, [ref(blade)]);
    pickModes(a, 0);
    const before = hand(game).length;
    attack(game, a, [blade]);
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("Renegade Doppelganger", () => {
  it("becomes a copy of the entering creature until end of turn", () => {
    const { game, a } = table();
    const doppel = spawn(game, "Renegade Doppelganger");
    pickModes(a, 0);
    enter(game, "Craw Wurm");
    expect(pt(game, doppel)).toEqual({ power: 6, toughness: 4 });
    toStep(game, "precombat-main", B);
    expect(pt(game, doppel)).toEqual({ power: 0, toughness: 1 });
  });
});

describe("Kabira Vindicator", () => {
  it("pumps other creatures +1/+1 at level 2-4 and +2/+2 at 5+", () => {
    const { game } = table();
    const kabira = spawn(game, "Kabira Vindicator");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "level", amount: 2 }, [ref(kabira)]);
    expect(pt(game, kabira)).toEqual({ power: 3, toughness: 6 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "level", amount: 3 }, [ref(kabira)]);
    expect(pt(game, kabira)).toEqual({ power: 4, toughness: 8 });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Domestication", () => {
  it("steals the creature, and is sacrificed at your end step if its power is 4 or greater", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const wurm = spawn(game, "Craw Wurm", B);
    const dom = toHand(game, "Domestication");
    cast(game, dom, { targets: [ref(wurm)] });
    expect(controller(game, wurm)).toBe(A);
    toStep(game, "precombat-main", B);
    expect(graveyard(game)).toContain(dom);
    expect(controller(game, wurm)).toBe(B);
  });

  it("stays on a creature with power 3 or less", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const dom = toHand(game, "Domestication");
    cast(game, dom, { targets: [ref(bears)] });
    toStep(game, "precombat-main", B);
    expect(zone(game, dom)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
  });
});

describe("Hada Spy Patrol", () => {
  it("is unblockable at level 1 and has shroud too at level 3", () => {
    const { game } = table();
    const hada = spawn(game, "Hada Spy Patrol");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "level", amount: 1 }, [ref(hada)]);
    expect(keywords(game, hada).has("unblockable")).toBe(true);
    expect(keywords(game, hada).has("shroud")).toBe(false);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "level", amount: 2 }, [ref(hada)]);
    expect(pt(game, hada)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, hada).has("shroud")).toBe(true);
  });
});

describe("Joraga Treespeaker", () => {
  it("taps for {G}{G} only from level 1", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const joraga = spawn(game, "Joraga Treespeaker");
    expect(() => activate(game, joraga, 1)).toThrow();
    activate(game, joraga, 0);
    expect(pt(game, joraga)).toEqual({ power: 1, toughness: 2 });
    activate(game, joraga, 1);
    expect(game.state.players[A].manaPool.length).toBe(2);
  });

  it("at level 5 gives other Elves the mana ability", () => {
    const { game } = table();
    const joraga = spawn(game, "Joraga Treespeaker");
    const elves = spawn(game, "Llanowar Elves");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "level", amount: 5 }, [ref(joraga)]);
    expect(pt(game, joraga)).toEqual({ power: 1, toughness: 4 });
    // Llanowar Elves' own ability is index 0; the granted one follows it.
    activate(game, elves, 1);
    expect(game.state.players[A].manaPool.length).toBe(2);
  });
});

describe("Snake Umbra", () => {
  it("the enchanted creature's damage to an opponent may draw a card", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Snake Umbra"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    pickModes(a, 0);
    const before = hand(game).length;
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(17);
    expect(hand(game).length).toBe(before + 1);
  });
});
