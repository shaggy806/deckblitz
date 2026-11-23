/**
 * Playtest batch 341, group E: playtest cards (Mystery Booster, Mystery
 * Booster 2, Unknown Event) the existing vocabulary runs exactly.
 */
import { describe, expect, it } from "vitest";

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
  named,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("playtest batch 341 E — Banding Sliver", () => {
  it("gives every player's Slivers banding", () => {
    const { game } = table();
    spawn(game, "Banding Sliver");
    const theirs = spawn(game, "Muscle Sliver", B);
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, theirs).has("banding")).toBe(true);
    expect(keywords(game, bears).has("banding")).toBe(false);
  });
});

describe("playtest batch 341 E — Cat Oven", () => {
  it("makes a Food, then turns a Food into a 1/1 black Cat and drains each opponent", () => {
    const { game } = table();
    const oven = enter(game, "Cat Oven");
    const food = named(game, "Food Token", A)[0];
    expect(food).toBeDefined();
    activate(game, oven, 0, { sacrifice: food });
    expect(tokensNamed(game, "Food Token", A)).toBe(0);
    const cat = named(game, "1/1 Black Cat Token", A)[0];
    expect(cat).toBeDefined();
    expect(pt(game, cat)).toEqual({ power: 1, toughness: 1 });
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });
});

describe("playtest batch 341 E — Farseeing Flockmate", () => {
  it("puts a flying counter on another creature, which gains the surveil trigger", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Farseeing Flockmate");
    expect(counters(game, bears, "flying")).toBe(1);
    expect(keywords(game, bears).has("flying")).toBe(true);
    let surveils = 0;
    a.chooseScryFn = () => {
      surveils += 1;
      return [];
    };
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(surveils).toBe(1);
  });

  it("its own trigger surveils on combat damage to a planeswalker", () => {
    const { game, a } = table();
    const flock = spawn(game, "Farseeing Flockmate");
    const walker = spawn(game, "Jace Beleren", B);
    game.state.objects[walker].counters.loyalty = 5;
    let surveils = 0;
    a.chooseScryFn = () => {
      surveils += 1;
      return [];
    };
    attack(game, a, [flock], walker);
    expect(game.state.objects[walker].counters.loyalty ?? 0).toBe(2);
    expect(surveils).toBe(1);
  });
});

describe("playtest batch 341 E — Gorilla Tactics", () => {
  it("makes one Gorilla cast, two when an opponent's effect discards it", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Gorilla Tactics"));
    expect(tokensNamed(game, "Gorilla Token", A)).toBe(1);
    const tactics = toHand(game, "Gorilla Tactics");
    nextTurn(game);
    a.chooseDiscardsFn = (h, n) => [tactics, ...h.map((o) => o.id).filter((id) => id !== tactics)].slice(0, n);
    lands(game, "Swamp", 3, B);
    cast(game, toHand(game, "Mind Rot", B), { player: B, targets: [ref(A)] });
    expect(zone(game, tactics)).toBe("graveyard");
    expect(tokensNamed(game, "Gorilla Token", A)).toBe(3);
  });
});

describe("playtest batch 341 E — Growth Charm", () => {
  it("Giant Growth: +3/+3; Regrowth: a card back to hand", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Growth Charm"), { modes: [1], targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    const dead = toGraveyard(game, "Lightning Bolt");
    cast(game, toHand(game, "Growth Charm"), { modes: [2], targets: [ref(dead)] });
    expect(hand(game)).toContain(dead);
  });
});

describe("playtest batch 341 E — Indicate", () => {
  it("targets a permanent and does nothing else", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Indicate");
    cast(game, card, { targets: [ref(bears)] });
    expect(graveyard(game)).toContain(card);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("playtest batch 341 E — Isamaru and Yoshimaru", () => {
  it("grows for another legendary creature or a creature with mana value one, not others", () => {
    const { game } = table();
    const dogs = enter(game, "Isamaru and Yoshimaru");
    enter(game, "Grizzly Bears");
    expect(counters(game, dogs)).toBe(0);
    enter(game, "Savannah Lions");
    expect(counters(game, dogs)).toBe(1);
    enter(game, "Thalia, Guardian of Thraben");
    expect(counters(game, dogs)).toBe(2);
    enter(game, "Savannah Lions", B);
    expect(counters(game, dogs)).toBe(2);
  });
});

describe("playtest batch 341 E — Joraga Peach", () => {
  it("gains life for its counters and moves its +1/+1 counters to a creature", () => {
    const { game } = table();
    const peach = enter(game, "Joraga Peach");
    enter(game, "Forest");
    enter(game, "Forest");
    expect(counters(game, peach)).toBe(2);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, peach, 0, { targets: [ref(bears)] });
    expect(zone(game, peach)).toBe("graveyard");
    expect(life(game, A)).toBe(22);
    expect(counters(game, bears)).toBe(2);
  });
});

describe("playtest batch 341 E — Life Cloud", () => {
  it("each player gains X, draws X and returns X creatures then X lands", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    for (const p of [A, B]) {
      toGraveyard(game, "Grizzly Bears", p);
      toGraveyard(game, "Forest", p);
    }
    const handB = hand(game, B).length;
    cast(game, toHand(game, "Life Cloud"), { x: 1 });
    for (const p of [A, B]) {
      expect(life(game, p)).toBe(21);
      expect(named(game, "Grizzly Bears", p).some((id) => zone(game, id) === "battlefield")).toBe(true);
      expect(named(game, "Forest", p).some((id) => zone(game, id) === "battlefield")).toBe(true);
    }
    expect(hand(game, B).length).toBe(handB + 1);
  });
});

describe("playtest batch 341 E — Stone Drake", () => {
  it("Enthrall: target player discards a card for each spell you've cast this turn", () => {
    const { game, a } = table();
    const wastes = spawn(game, "Wastes");
    cast(game, toHand(game, "Indicate"), { targets: [ref(wastes)] });
    cast(game, toHand(game, "Indicate"), { targets: [ref(wastes)] });
    const before = hand(game, B).length;
    pickModes(a, 1);
    pickTargets(a, B);
    enter(game, "Stone Drake");
    expect(hand(game, B).length).toBe(before - 2);
  });

  it("Distract: taps target land and draws a card", () => {
    const { game, a } = table();
    const land = spawn(game, "Forest", B);
    const before = hand(game).length;
    pickModes(a, 0);
    pickTargets(a, land);
    enter(game, "Stone Drake");
    expect(game.state.objects[land].tapped).toBe(true);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("playtest batch 341 E — Tarelily, Lovestruck Archer", () => {
  it("paired with a Dwarf, both have reach and lifelink", () => {
    const { game, a } = table();
    const dwarf = spawn(game, "Dwarven Trader");
    pickPermanents(a, dwarf);
    const tare = enter(game, "Tarelily, Lovestruck Archer");
    for (const id of [tare, dwarf]) {
      expect(keywords(game, id).has("reach")).toBe(true);
      expect(keywords(game, id).has("lifelink")).toBe(true);
    }
  });

  it("paired with a non-Dwarf, both have reach but not lifelink; unpaired, neither", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Dwarven Trader");
    pickPermanents(a, bears);
    const tare = enter(game, "Tarelily, Lovestruck Archer");
    expect(keywords(game, bears).has("reach")).toBe(true);
    expect(keywords(game, tare).has("reach")).toBe(true);
    expect(keywords(game, tare).has("lifelink")).toBe(false);
    expect(keywords(game, other).has("reach")).toBe(false);
  });

  it("Elf spells cost {1} less", () => {
    const { game } = table();
    spawn(game, "Tarelily, Lovestruck Archer");
    lands(game, "Forest", 1);
    const elf = toHand(game, "Elvish Visionary");
    cast(game, elf);
    expect(zone(game, elf)).toBe("battlefield");
  });
});

describe("playtest batch 341 E — That's No Moonmist", () => {
  it("transforms an Incubator token into a Phyrexian artifact creature", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    game.debugApplyEffect(A, { kind: "incubate", amount: 2 }, []);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    const incubator = Object.values(game.state.objects).find(
      (o) => o.zone === "battlefield" && subtypes(game, o.id).includes("Incubator"),
    )?.id;
    expect(incubator).toBeDefined();
    cast(game, toHand(game, "That's No Moonmist"));
    expect(types(game, incubator!)).toContain("creature");
    expect(subtypes(game, incubator!)).toContain("Phyrexian");
    // Back face up, it isn't on its front face: a second one leaves it be.
    lands(game, "Forest", 2);
    cast(game, toHand(game, "That's No Moonmist"));
    expect(types(game, incubator!)).toContain("creature");
  });
});

describe("playtest batch 341 E — The Sixth Seraph", () => {
  it("an artifact spell has demonstrate: you and an opponent each get a token copy", () => {
    const { game, a } = table();
    spawn(game, "The Sixth Seraph");
    lands(game, "Wastes", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Sol Ring"));
    expect(named(game, "Sol Ring", A).filter((id) => zone(game, id) === "battlefield")).toHaveLength(2);
    expect(named(game, "Sol Ring", B).filter((id) => zone(game, id) === "battlefield")).toHaveLength(1);
  });
});

describe("playtest batch 341 E — Unicycle", () => {
  it("crewed, it's a creature and comes unattached (rule 301.5c)", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const bears = spawn(game, "Grizzly Bears");
    const cycle = spawn(game, "Unicycle");
    activate(game, cycle, 0, { targets: [ref(bears)] });
    expect(game.state.objects[cycle].attachedTo).toBe(bears);
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    activate(game, cycle, 1);
    expect(types(game, cycle)).toContain("creature");
    expect(game.state.objects[cycle].attachedTo ?? null).toBeNull();
  });
});
