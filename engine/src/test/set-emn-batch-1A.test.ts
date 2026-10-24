/**
 * Conspiracy: Take the Crown and Eldritch Moon, group A: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
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
  named,
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
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const faceName = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);

describe("Subterranean Tremors", () => {
  it("X = 8: damages each creature without flying, destroys all artifacts and makes an 8/8 Lizard", () => {
    const { game } = table();
    lands(game, "Mountain", 9);
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel", B);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Subterranean Tremors"), { x: 8 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, angel)).toBe("battlefield");
    expect(zone(game, ring)).toBe("graveyard");
    expect(tokensNamed(game, "Lizard Token", A)).toBe(1);
  });

  it("X = 3: no artifact is destroyed and no Lizard is made", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Subterranean Tremors"), { x: 3 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, ring)).toBe("battlefield");
    expect(tokensNamed(game, "Lizard Token")).toBe(0);
  });
});

describe("Messenger Jays", () => {
  it("a counter per feather vote, a draw per quill vote, then a discard per card drawn", () => {
    const { game, a, b } = table();
    pickModes(a, 0);
    pickModes(b, 1);
    const before = hand(game).length;
    const jays = enter(game, "Messenger Jays");
    expect(counters(game, jays)).toBe(1);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game)).toHaveLength(1);
  });
});

describe("Orchard Elemental", () => {
  it("two counters per sprout vote and 3 life per harvest vote", () => {
    const { game, a, b } = table();
    pickModes(a, 0);
    pickModes(b, 1);
    const elemental = enter(game, "Orchard Elemental");
    expect(counters(game, elemental)).toBe(2);
    expect(life(game)).toBe(23);
  });
});

describe("Fang of the Pack", () => {
  it("gives another creature melee at the beginning of combat", () => {
    const { game, a } = table();
    spawn(game, "Fang of the Pack");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(17);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Stromkirk Occultist", () => {
  it("exiles the top card on combat damage, playable this turn", () => {
    const { game, a } = table();
    const occultist = spawn(game, "Stromkirk Occultist");
    const top = toLibrary(game, "Grizzly Bears");
    attack(game, a, [occultist]);
    expect(zone(game, top)).toBe("exile");
    lands(game, "Forest", 2);
    cast(game, top, { via: "impulse" });
    expect(zone(game, top)).toBe("battlefield");
  });
});

describe("Faith Unbroken", () => {
  it("exiles an opponent's creature until it leaves, and pumps the creature it enchants", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel", B);
    const faith = toHand(game, "Faith Unbroken");
    pickTargets(a, angel);
    cast(game, faith, { targets: [ref(bears)] });
    expect(zone(game, angel)).toBe("exile");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    destroy(game, faith);
    expect(named(game, "Serra Angel", B)).toHaveLength(1);
  });
});

describe("Lone Rider // It That Rides as One", () => {
  it("transforms at an opponent's end step if you gained 3 life that turn", () => {
    const { game } = table();
    const rider = spawn(game, "Lone Rider");
    toStep(game, "precombat-main", B);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    toStep(game, "end", B);
    settle(game);
    expect(faceName(game, rider)).toBe("It That Rides as One");
    expect(pt(game, rider)).toEqual({ power: 4, toughness: 4 });
  });

  it("doesn't transform having gained only 2", () => {
    const { game } = table();
    const rider = spawn(game, "Lone Rider");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 }, []);
    toStep(game, "end");
    settle(game);
    expect(faceName(game, rider)).toBe("Lone Rider");
  });
});

describe("Ironclad Slayer", () => {
  it("may return an Aura card from your graveyard to your hand", () => {
    const { game, a } = table();
    const aura = toGraveyard(game, "Pacifism");
    pickTargets(a, aura);
    pickModes(a, 0);
    enter(game, "Ironclad Slayer");
    expect(zone(game, aura)).toBe("hand");
  });
});

describe("Otherworldly Outburst", () => {
  it("makes a 3/2 Eldrazi Horror when the creature dies this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Otherworldly Outburst"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    destroy(game, bears);
    expect(tokensNamed(game, "Eldrazi Horror Token", A)).toBe(1);
  });
});

describe("Shreds of Sanity", () => {
  it("returns an instant and a sorcery, then discards a card, and exiles itself", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const instant = toGraveyard(game, "Shock");
    const sorcery = toGraveyard(game, "Divination");
    const shreds = toHand(game, "Shreds of Sanity");
    const before = hand(game).length;
    cast(game, shreds, { targets: [ref(instant), ref(sorcery)] });
    expect(hand(game).length).toBe(before - 1 + 2 - 1);
    expect(zone(game, shreds)).toBe("exile");
    expect(graveyard(game)).toHaveLength(1);
  });
});

describe("Abandon Reason", () => {
  it("two creatures each get +1/+0 and first strike", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Abandon Reason"), { targets: [ref(x), ref(y)] });
    for (const id of [x, y]) {
      expect(pt(game, id)).toEqual({ power: 3, toughness: 2 });
      expect(keywords(game, id).has("first-strike")).toBe(true);
    }
  });
});

describe("Shrill Howler // Howling Chorus", () => {
  it("transforms for {5}{G}; Howling Chorus makes an Eldrazi Horror on combat damage", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const howler = spawn(game, "Shrill Howler");
    activate(game, howler);
    expect(faceName(game, howler)).toBe("Howling Chorus");
    expect(pt(game, howler)).toEqual({ power: 3, toughness: 5 });
    attack(game, a, [howler]);
    expect(life(game, B)).toBe(17);
    expect(tokensNamed(game, "Eldrazi Horror Token", A)).toBe(1);
  });
});

describe("Smoldering Werewolf", () => {
  it("deals 1 damage to each of two target creatures as it enters", () => {
    const { game, a } = table();
    const x = spawn(game, "Llanowar Elves", B);
    const y = spawn(game, "Llanowar Elves", B);
    pickTargets(a, x, y);
    enter(game, "Smoldering Werewolf");
    expect(zone(game, x)).toBe("graveyard");
    expect(zone(game, y)).toBe("graveyard");
  });
});

describe("Courageous Outrider", () => {
  it("puts a Human card from the top four into your hand", () => {
    const { game, a } = table();
    const human = toLibrary(game, "Courageous Outrider");
    const seen = pickFromZone(a, human);
    enter(game, "Courageous Outrider");
    expect(seen.offered).toEqual([human]);
    expect(zone(game, human)).toBe("hand");
  });
});

describe("Strange Augmentation", () => {
  it("+1/+1, and +3/+3 with delirium", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Strange Augmentation"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    for (const card of ["Grizzly Bears", "Wastes", "Shock", "Divination"]) toGraveyard(game, card);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Borrowed Malevolence", () => {
  it("both modes for {B} plus escalate {2}", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const mine = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves", B);
    cast(game, toHand(game, "Borrowed Malevolence"), { modes: [0, 1], targets: [ref(mine), ref(elves)] });
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
    expect(zone(game, elves)).toBe("graveyard");
  });

  it("can't choose both modes without the escalate mana", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const mine = spawn(game, "Grizzly Bears");
    const spell = toHand(game, "Borrowed Malevolence");
    expect(() => cast(game, spell, { modes: [0, 1], targets: [ref(mine), ref(mine)] })).toThrow();
  });
});

describe("Galvanic Bombardment", () => {
  it("deals 2 plus the number of Galvanic Bombardments in your graveyard", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    toGraveyard(game, "Galvanic Bombardment");
    toGraveyard(game, "Galvanic Bombardment", B); // not yours
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Galvanic Bombardment"), { targets: [ref(angel)] });
    expect(game.state.objects[angel].damageMarked).toBe(3);
  });
});
