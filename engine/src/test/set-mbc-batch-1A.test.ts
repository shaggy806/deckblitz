/**
 * Marvel: Darkhold Destiny previews (MDD, MDC) and Mystery Booster Commander
 * (MBC) — batch 269, group A: one-off legendary commanders and planeswalkers.
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
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  nextTurn,
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

describe("The Darkhold", () => {
  it("draws a card per sin counter, then costs a life per card in hand", () => {
    const { game } = table();
    const book = spawn(game, "The Darkhold");
    const before = hand(game).length;
    activate(game, book, 0);
    expect(counters(game, book, "sin")).toBe(1);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(20 - (before + 1));
    game.state.objects[book].tapped = false;
    activate(game, book, 0);
    expect(counters(game, book, "sin")).toBe(2);
    expect(hand(game).length).toBe(before + 3);
    expect(life(game)).toBe(20 - (before + 1) - (before + 3));
  });
});

describe("Hela's Arcanum", () => {
  it("destroys each non-Zombie creature with power 3 or less; the protected one returns tapped", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const bears = spawn(game, "Grizzly Bears");
    const corpse = spawn(game, "Walking Corpse", B);
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Hela's Arcanum"), { modes: [1, 2], targets: [ref(bears)] });
    expect(zone(game, corpse)).toBe("battlefield");
    expect(zone(game, wurm)).toBe("battlefield");
    const back = named(game, "Grizzly Bears", A);
    expect(back).toHaveLength(1);
    expect(game.state.objects[back[0]].tapped).toBe(true);
  });
});

describe("Rise from the Nether", () => {
  it("makes a 3/1 Mindless-One for each noncreature, nonland card in your graveyard", () => {
    const { game } = table();
    lands(game, "Mountain", 7);
    toGraveyard(game, "Opt");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Swamp");
    cast(game, toHand(game, "Rise from the Nether"));
    expect(tokensNamed(game, "Mindless-One Token", A)).toBe(2);
  });
});

describe("Gargantos, the Endbringer", () => {
  it("enters with three counters and doubles them each upkeep", () => {
    const { game } = table();
    const gargantos = enter(game, "Gargantos, the Endbringer");
    expect(counters(game, gargantos)).toBe(3);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, gargantos)).toBe(6);
  });
});

describe("Ekthi, Contaminator Priest", () => {
  it("gives an Equipment that enters living weapon, and the Germ the Phyrexian bonus", () => {
    const { game } = table();
    spawn(game, "Ekthi, Contaminator Priest");
    lands(game, "Wastes", 1);
    const splitter = toHand(game, "Bonesplitter");
    cast(game, splitter);
    const germs = named(game, "Phyrexian Germ Token", A);
    expect(germs).toHaveLength(1);
    expect(game.state.objects[splitter].attachedTo).toBe(germs[0]);
    expect(pt(game, germs[0])).toEqual({ power: 3, toughness: 1 });
  });
});

describe("Uugguu, the Omniplasm", () => {
  it("copies a nontoken Ooze that dies twice, as 2/2s", () => {
    const { game } = table();
    spawn(game, "Uugguu, the Omniplasm");
    const ooze = spawn(game, "Primordial Ooze");
    destroy(game, ooze);
    const copies = named(game, "Primordial Ooze", A);
    expect(copies).toHaveLength(2);
    for (const id of copies) expect(pt(game, id)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Worzel, the Protector", () => {
  it("0 makes the Cat, whose tap puts a loyalty counter on each planeswalker you control", () => {
    const { game } = table();
    const worzel = spawn(game, "Worzel, the Protector");
    loyalty(game, worzel, 0, { atLeast: 4 });
    expect(tokensNamed(game, "Cat Token (Loyalty Counters)", A)).toBe(1);
    const cat = spawn(game, "Cat Token (Loyalty Counters)");
    activate(game, cat, 0);
    expect(counters(game, worzel, "loyalty")).toBe(5);
  });

  it("−8 makes ten Scryb Sprites", () => {
    const { game } = table();
    const worzel = spawn(game, "Worzel, the Protector");
    loyalty(game, worzel, -8, { atLeast: 8 });
    expect(tokensNamed(game, "Scryb Sprites Token", A)).toBe(10);
  });
});

describe("Tsagan, Raider Warlord", () => {
  it("pumps your creatures +1/+0 for each with first strike or double strike", () => {
    const { game, a } = table();
    const tsagan = spawn(game, "Tsagan, Raider Warlord");
    const knight = spawn(game, "Youthful Knight");
    attack(game, a, [tsagan]);
    expect(pt(game, knight).power).toBe(4);
  });
});

describe("Rikala, Homarid King", () => {
  it("pumps by tide counters, and the fourth clears them", () => {
    const { game } = table();
    const rikala = spawn(game, "Rikala, Homarid King");
    game.state.objects[rikala].counters.tide = 3;
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bears).power).toBe(5);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, rikala, "tide")).toBe(0);
    expect(pt(game, bears).power).toBe(2);
  });
});

describe("Olinda the Oblivious", () => {
  it("odor counter: the creature's controller loses 2 at their upkeep, even after Olinda leaves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const olinda = enter(game, "Olinda the Oblivious");
    expect(counters(game, bears, "odor")).toBe(1);
    destroy(game, olinda);
    nextTurn(game, "draw");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

describe("The Weaver King", () => {
  it("mills that many, then takes a creature card milled from that player's library", () => {
    const { game, a } = table();
    const king = spawn(game, "The Weaver King");
    toLibrary(game, "Grizzly Bears", B);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    attack(game, a, [king]);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
  });
});

describe("Kuroki, Thief of Talents", () => {
  it("grows when the opponent declines to draw", () => {
    const { game, a, b } = table();
    const kuroki = spawn(game, "Kuroki, Thief of Talents");
    pickTargets(a, B);
    pickModes(b);
    toStep(game, "end");
    settle(game);
    expect(counters(game, kuroki)).toBe(2);
  });

  it("the opponent who accepts draws four, and Kuroki doesn't grow", () => {
    const { game, a, b } = table();
    const kuroki = spawn(game, "Kuroki, Thief of Talents");
    pickTargets(a, B);
    pickModes(b, 0);
    const before = hand(game, B).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game, B).length).toBe(before + 4);
    expect(counters(game, kuroki)).toBe(0);
  });
});

describe("Meatsqueak, Hoard Lord", () => {
  it("Squirrels get +3/+3 for every seven Foods", () => {
    const { game } = table();
    const squeak = spawn(game, "Meatsqueak, Hoard Lord");
    game.debugApplyEffect(A, { kind: "create-token", token: "Food Token", count: 6 }, []);
    expect(pt(game, squeak)).toEqual({ power: 2, toughness: 3 });
    game.debugApplyEffect(A, { kind: "create-token", token: "Food Token", count: 1 }, []);
    expect(pt(game, squeak)).toEqual({ power: 5, toughness: 6 });
  });
});

describe("Lyna, Veil of Vengeance", () => {
  it("a shadow counter gives shadow", () => {
    const { game } = table();
    const lyna = spawn(game, "Lyna, Veil of Vengeance");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    activate(game, lyna, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("shadow")).toBe(true);
  });
});

describe("Balefang the Unslayable", () => {
  it("the target opponent gets a tapped Baneslayer Angel token; nobody gains life", () => {
    const { game, a } = table();
    pickTargets(a, B);
    enter(game, "Balefang the Unslayable");
    const angels = named(game, "Baneslayer Angel Token", B);
    expect(angels).toHaveLength(1);
    expect(game.state.objects[angels[0]].tapped).toBe(true);
    game.debugApplyEffect(B, { kind: "gain-life", amount: 3 }, []);
    expect(life(game, B)).toBe(20);
  });
});

describe("Chief Magistrate of Mercadia", () => {
  it("as the monarch, copies each creature token after making the Goblin", () => {
    const { game } = table();
    spawn(game, "Chief Magistrate of Mercadia");
    game.debugApplyEffect(A, { kind: "become-monarch" }, []);
    game.debugApplyEffect(A, { kind: "create-token", token: "Zombie Token", count: 1 }, []);
    toStep(game, "upkeep");
    settle(game);
    expect(tokensNamed(game, "Goblin Token (Rakdos Guildmage)", A)).toBe(2);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(2);
  });
});

describe("Grandmother Goby", () => {
  it("counters your noncreature spell and makes a Merfolk per mana spent", () => {
    const { game } = table();
    spawn(game, "Grandmother Goby");
    lands(game, "Island", 3);
    const div = toHand(game, "Divination");
    cast(game, div);
    expect(zone(game, div)).toBe("graveyard");
    expect(tokensNamed(game, "Merfolk Token", A)).toBe(3);
  });
});

describe("Greensleeves", () => {
  it("−3 puts every permanent card milled into your hand", () => {
    const { game, a } = table();
    const gs = spawn(game, "Greensleeves");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Opt");
    a.chooseFromZoneFn = (_view, eligible) => eligible;
    const before = hand(game).length;
    loyalty(game, gs, -3, { atLeast: 5 });
    expect(hand(game).length).toBe(before + 2);
    expect(named(game, "Opt")).toHaveLength(0);
  });
});

describe("Joven and Chandler", () => {
  it("grows by the mana value of an artifact put into a graveyard", () => {
    const { game } = table();
    const joven = spawn(game, "Joven and Chandler");
    const stone = spawn(game, "Mind Stone", B);
    destroy(game, stone);
    expect(counters(game, joven)).toBe(2);
  });
});

describe("Nephilim Epochal", () => {
  it("each Nephilim gets +1/+1 for each other Nephilim you control", () => {
    const { game } = table();
    const epochal = spawn(game, "Nephilim Epochal");
    const brood = spawn(game, "Dune-Brood Nephilim");
    expect(pt(game, epochal)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, brood)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Ashaya's Enduring Bond", () => {
  it("is a legendary sorcery that discovers for the mana spent", () => {
    const { game } = table();
    spawn(game, "Gargantos, the Endbringer");
    lands(game, "Mountain", 1);
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    cast(game, toHand(game, "Ashaya's Enduring Bond"));
    expect(zone(game, bears)).not.toBe("library");
  });

  it("can't be cast without a legendary creature or planeswalker", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 2);
    expect(() => cast(game, toHand(game, "Ashaya's Enduring Bond"))).toThrow(/refused/);
  });
});
