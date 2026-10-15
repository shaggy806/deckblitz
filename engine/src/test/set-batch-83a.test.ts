/**
 * Set walk batch 83, part a (2026-10-16): Tarkir: Dragonstorm (TDM), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
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

const isToken = (game: Game, id: ObjectId): boolean => game.state.objects[id].isToken === true;
const libraryTop = (game: Game): ObjectId => game.state.zones.perPlayer[A].library[0];

describe("Cruel Truths", () => {
  it("surveils 2, draws two cards and costs 2 life", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const truths = toHand(game, "Cruel Truths");
    const before = hand(game).length;
    cast(game, truths);
    expect(hand(game).length).toBe(before - 1 + 2);
    expect(life(game)).toBe(18);
  });
});

describe("Flamehold Grappler", () => {
  it("copies the next spell you cast this turn, and only that one", () => {
    const { game, a } = table();
    enter(game, "Flamehold Grappler");
    lands(game, "Mountain", 2);
    pickTargets(a, B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(11);
  });

  it("copies a creature spell too, the copy becoming a token", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    lands(game, "Forest", 2);
    // Cast, not `enter`ed, so it's still the main phase for the Bears.
    cast(game, toHand(game, "Flamehold Grappler"));
    cast(game, toHand(game, "Grizzly Bears"));
    const bears = named(game, "Grizzly Bears", A);
    expect(bears).toHaveLength(2);
    expect(bears.filter((id) => isToken(game, id))).toHaveLength(1);
  });

  it("lapses at the end of the turn", () => {
    const { game } = table();
    enter(game, "Flamehold Grappler");
    toStep(game, "precombat-main");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });
});

describe("Stormbeacon Blade", () => {
  it("gives +3/+0 and draws when the equipped creature attacks beside two others", () => {
    const { game, a } = table();
    const blade = spawn(game, "Stormbeacon Blade");
    const [one, two, three] = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    lands(game, "Wastes", 2);
    activate(game, blade, 0, { targets: [ref(one)] });
    expect(pt(game, one)).toEqual({ power: 5, toughness: 2 });
    const before = hand(game).length;
    attack(game, a, [one, two, three]);
    expect(hand(game).length).toBe(before + 1);
  });

  it("draws nothing with fewer than three attacking creatures", () => {
    const { game, a } = table();
    const blade = spawn(game, "Stormbeacon Blade");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    activate(game, blade, 0, { targets: [ref(one)] });
    const before = hand(game).length;
    attack(game, a, [one, two]);
    expect(hand(game).length).toBe(before);
  });
});

describe("Rally the Monastery", () => {
  it("makes two Monks with prowess", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Rally the Monastery"), { modes: [0] });
    expect(tokensNamed(game, "Monk Token", A)).toBe(2);
  });

  it("costs {2} less once you've cast another spell, and destroys only a creature with power 4 or greater", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const wurm = spawn(game, "Craw Wurm", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const rally = toHand(game, "Rally the Monastery");
    expect(() => cast(game, rally, { modes: [2], targets: [ref(wurm)] })).toThrow();
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(() => cast(game, rally, { modes: [2], targets: [ref(bears)] })).toThrow();
    cast(game, rally, { modes: [2], targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("pumps up to two creatures you control", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Rally the Monastery"), { modes: [1], targets: [ref(one), ref(two)] });
    expect(pt(game, one)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, two)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Marshal of the Lost", () => {
  it("gives the target +X/+X, X the number of attacking creatures", () => {
    const { game, a } = table();
    const marshal = spawn(game, "Marshal of the Lost");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    pickTargets(a, bears);
    attack(game, a, [marshal, bears, giant]);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, marshal).has("deathtouch")).toBe(true);
  });
});

describe("Jeskai Revelation", () => {
  it("bounces, deals 4, makes two Monks, draws two and gains 4", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    lands(game, "Wastes", 4);
    const giant = spawn(game, "Hill Giant", B);
    const revelation = toHand(game, "Jeskai Revelation");
    const before = hand(game).length;
    cast(game, revelation, { targets: [ref(giant), ref(B)] });
    expect(zone(game, giant)).toBe("hand");
    expect(life(game, B)).toBe(16);
    expect(tokensNamed(game, "Monk Token", A)).toBe(2);
    expect(hand(game).length).toBe(before - 1 + 2);
    expect(life(game)).toBe(24);
  });

  it("returns a spell to its owner's hand", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Mountain", 2);
    lands(game, "Plains", 1);
    lands(game, "Wastes", 4);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Jeskai Revelation"), { targets: [ref(bolt), ref(B)] });
    expect(zone(game, bolt)).toBe("hand");
    expect(life(game, B)).toBe(16);
  });
});

describe("Sage of the Skies", () => {
  it("isn't copied as the first spell of the turn", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Sage of the Skies"));
    expect(named(game, "Sage of the Skies", A)).toHaveLength(1);
  });

  it("is copied, as a token, when you've cast another spell this turn", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    cast(game, toHand(game, "Sage of the Skies"));
    const sages = named(game, "Sage of the Skies", A);
    expect(sages).toHaveLength(2);
    expect(sages.filter((id) => isToken(game, id))).toHaveLength(1);
  });
});

describe("Sunpearl Kirin", () => {
  it("returns a token you control and draws a card", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Monk Token", count: 1 }, []);
    const [monk] = named(game, "Monk Token", A);
    pickTargets(a, monk);
    const before = hand(game).length;
    enter(game, "Sunpearl Kirin");
    expect(tokensNamed(game, "Monk Token", A)).toBe(0);
    expect(hand(game).length).toBe(before + 1);
  });

  it("returns a nontoken permanent without drawing", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const before = hand(game).length;
    enter(game, "Sunpearl Kirin");
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
  });

  it("may return nothing", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, null);
    const before = hand(game).length;
    enter(game, "Sunpearl Kirin");
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game).length).toBe(before);
  });
});

describe("Wingblade Disciple", () => {
  it("makes a Bird on your second spell each turn, not your third", () => {
    const { game } = table();
    spawn(game, "Wingblade Disciple");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Bird Token", A)).toBe(0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Bird Token", A)).toBe(1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Bird Token", A)).toBe(1);
  });
});

describe("Embermouth Sentinel", () => {
  it("puts a basic land on top of your library", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    toLibrary(game, "Wastes");
    pickModes(a, 0);
    pickFromZone(a, forest);
    enter(game, "Embermouth Sentinel");
    expect(libraryTop(game)).toBe(forest);
  });

  it("puts it onto the battlefield tapped instead while you control a Dragon", () => {
    const { game, a } = table();
    spawn(game, "Shivan Dragon");
    const forest = toLibrary(game, "Forest");
    pickModes(a, 0);
    pickFromZone(a, forest);
    enter(game, "Embermouth Sentinel");
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });

  it("searches nothing when declined", () => {
    const { game, a } = table();
    spawn(game, "Shivan Dragon");
    const forest = toLibrary(game, "Forest");
    toLibrary(game, "Wastes");
    pickModes(a);
    enter(game, "Embermouth Sentinel");
    expect(zone(game, forest)).toBe("library");
  });
});

describe("Lie in Wait", () => {
  it("returns a creature card and deals damage equal to its power to target creature", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    const giant = toGraveyard(game, "Hill Giant");
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Lie in Wait"), { targets: [ref(giant), ref(wurm)] });
    expect(zone(game, giant)).toBe("hand");
    expect(game.state.objects[wurm].damageMarked).toBe(3);
  });
});

describe("Rainveil Rejuvenator", () => {
  it("may mill three as it enters, and taps for {G} equal to its power", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const rejuvenator = enter(game, "Rainveil Rejuvenator");
    expect(graveyard(game).length).toBe(3);
    activate(game, rejuvenator, 0);
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["G", "G"]);
  });
});

describe("Roar of Endless Song", () => {
  it("makes a 5/5 Elephant on I and II, then doubles your creatures on III", () => {
    const { game } = table();
    const saga = spawn(game, "Roar of Endless Song");
    settle(game);
    expect(tokensNamed(game, "5/5 Elephant Token", A)).toBe(1);
    toStep(game, "precombat-main");
    settle(game);
    expect(tokensNamed(game, "5/5 Elephant Token", A)).toBe(2);
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "precombat-main");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    for (const id of named(game, "5/5 Elephant Token", A)) expect(pt(game, id)).toEqual({ power: 10, toughness: 10 });
    expect(zone(game, saga)).toBe("graveyard");
  });
});

describe("Glacial Dragonhunt", () => {
  it("draws, and discarding a nonland card deals 3 damage to target creature", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    const bears = toHand(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a, 0);
    a.chooseDiscardsFn = () => [bears];
    pickTargets(a, giant);
    cast(game, toHand(game, "Glacial Dragonhunt"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("deals nothing when a land is discarded", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a, 0);
    pickTargets(a, giant);
    const graveyardBefore = graveyard(game).length;
    cast(game, toHand(game, "Glacial Dragonhunt"));
    // The Dragonhunt itself and the discarded land.
    expect(graveyard(game).length).toBe(graveyardBefore + 2);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("can be cast from the graveyard with harmonize, then is exiled", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 4);
    const hunt = toGraveyard(game, "Glacial Dragonhunt");
    const before = hand(game).length;
    cast(game, hunt, { via: "harmonize" });
    expect(hand(game).length).toBe(before + 1);
    expect(zone(game, hunt)).toBe("exile");
  });
});

describe("Jeskai Shrinekeeper", () => {
  it("gains 1 life and draws a card when it deals combat damage to a player", () => {
    const { game, a } = table();
    const keeper = spawn(game, "Jeskai Shrinekeeper", A, { sick: true });
    const before = hand(game).length;
    attack(game, a, [keeper]);
    expect(life(game, B)).toBe(17);
    expect(life(game)).toBe(21);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("United Battlefront", () => {
  it("puts up to two noncreature, nonland permanent cards with mana value 3 or less onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const tithe = toLibrary(game, "Smothering Tithe");
    const bears = toLibrary(game, "Grizzly Bears");
    const ring = toLibrary(game, "Sol Ring");
    const bolt = toLibrary(game, "Lightning Bolt");
    const signet = toLibrary(game, "Arcane Signet");
    const seen = pickFromZone(a, ring, signet);
    cast(game, toHand(game, "United Battlefront"));
    expect(seen.offered).toEqual(expect.arrayContaining([ring, signet]));
    for (const id of [tithe, bears, bolt]) expect(seen.offered).not.toContain(id);
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, signet)).toBe("battlefield");
    expect(zone(game, tithe)).toBe("library");
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, bolt)).toBe("library");
    expect(libraryTop(game)).not.toBe(bolt);
  });
});

describe("Kin-Tree Severance", () => {
  it("exiles a permanent with mana value 3 or greater, not a smaller one", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const severance = toHand(game, "Kin-Tree Severance");
    expect(() => cast(game, severance, { targets: [ref(bears)] })).toThrow();
    cast(game, severance, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
  });

  it("can be paid with {2} for each hybrid symbol", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Kin-Tree Severance"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
  });
});

describe("Mardu Monument", () => {
  it("finds a basic Mountain, Plains or Swamp as it enters", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    const swamp = toLibrary(game, "Swamp");
    const seen = pickFromZone(a, swamp);
    enter(game, "Mardu Monument");
    expect(seen.offered).toContain(swamp);
    expect(seen.offered).not.toContain(forest);
    expect(zone(game, swamp)).toBe("hand");
  });

  it("sacrifices for three Warriors with menace and haste this turn", () => {
    const { game } = table();
    const monument = spawn(game, "Mardu Monument");
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 2);
    activate(game, monument, 0);
    expect(zone(game, monument)).toBe("graveyard");
    const warriors = named(game, "Red Warrior Token", A);
    expect(tokensNamed(game, "Red Warrior Token", A)).toBe(3);
    expect(keywords(game, warriors[0]).has("menace")).toBe(true);
    expect(keywords(game, warriors[0]).has("haste")).toBe(true);
    toStep(game, "precombat-main");
    expect(keywords(game, named(game, "Red Warrior Token", A)[0]).has("haste")).toBe(false);
  });
});
