/**
 * Innistrad: Crimson Vow, group c. One test (or two) per card, on its
 * riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { printedCardName } from "../state.js";
import {
  A,
  B,
  activate,
  attack,
  blockOffer,
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
  pickPermanents,
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

const BLOOD = "Blood Token";

const makeBlood = (game: Game, count: number, player: PlayerId = A): void => {
  game.debugApplyEffect(player, { kind: "create-token", token: BLOOD, count }, []);
};

const attachTo = (game: Game, attachment: ObjectId, host: ObjectId): void => {
  game.state.objects[attachment].attachedTo = host;
};

const canBlock = (offer: ReturnType<typeof blockOffer>, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("Persistent Specimen", () => {
  it("returns itself from the graveyard to the battlefield tapped for {2}{B}", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const specimen = toGraveyard(game, "Persistent Specimen");
    activate(game, specimen, 0);
    expect(zone(game, specimen)).toBe("battlefield");
    expect(game.state.objects[specimen].tapped).toBe(true);
  });
});

describe("Bloodtithe Harvester", () => {
  it("makes a Blood token; its sacrifice gives -X/-X, X twice the Blood tokens you control as it resolves", () => {
    const t = table();
    enter(t.game, "Bloodtithe Harvester");
    expect(tokensNamed(t.game, BLOOD, A)).toBe(1);

    const { game } = table();
    const harvester = spawn(game, "Bloodtithe Harvester");
    makeBlood(game, 1);
    makeBlood(game, 1);
    makeBlood(game, 1, B); // an opponent's Blood doesn't count
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    activate(game, harvester, 0, { targets: [ref(dreadmaw)] });
    expect(zone(game, harvester)).toBe("graveyard");
    expect(pt(game, dreadmaw)).toEqual({ power: 2, toughness: 2 });
  });

  it("is sorcery speed", () => {
    const { game } = table({ step: "upkeep" });
    const harvester = spawn(game, "Bloodtithe Harvester");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, harvester, 0, { targets: [ref(bears)] })).toThrow();
  });
});

describe("Wedding Invitation", () => {
  it("draws on entering; a Vampire it targets is unblockable and gains lifelink", () => {
    const { game } = table();
    const before = hand(game).length;
    const invitation = enter(game, "Wedding Invitation");
    expect(hand(game).length).toBe(before + 1);
    const vampire = spawn(game, "Bloodtithe Harvester");
    activate(game, invitation, 0, { targets: [ref(vampire)] });
    expect(zone(game, invitation)).toBe("graveyard");
    expect(keywords(game, vampire).has("unblockable")).toBe(true);
    expect(keywords(game, vampire).has("lifelink")).toBe(true);
  });

  it("a non-Vampire is only made unblockable", () => {
    const { game } = table();
    const invitation = spawn(game, "Wedding Invitation");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, invitation, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("unblockable")).toBe(true);
    expect(keywords(game, bears).has("lifelink")).toBe(false);
  });
});

describe("Moldgraf Millipede", () => {
  it("mills three, then counts every creature card in your graveyard, those already there included", () => {
    const { game } = table();
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Grizzly Bears", B); // not yours
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Lightning Bolt");
    toLibrary(game, "Hill Giant");
    const millipede = enter(game, "Moldgraf Millipede");
    expect(counters(game, millipede)).toBe(3);
    expect(pt(game, millipede)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Falkenrath Forebear", () => {
  it("can't block, and makes a Blood token when it deals combat damage to a player", () => {
    const { game, a } = table();
    const forebear = spawn(game, "Falkenrath Forebear", B);
    const theirBears = spawn(game, "Grizzly Bears", B);
    const bears = spawn(game, "Grizzly Bears");
    const offer = blockOffer(game, a, [bears]);
    expect(canBlock(offer, forebear)).toEqual([]);
    expect(canBlock(offer, theirBears)).toEqual([bears]);

    const t = table();
    const mine = spawn(t.game, "Falkenrath Forebear");
    attack(t.game, t.a, [mine]);
    expect(life(t.game, B)).toBe(17);
    expect(tokensNamed(t.game, BLOOD, A)).toBe(1);
  });

  it("{B}, sacrifice two Blood tokens: returns from the graveyard to the battlefield", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    makeBlood(game, 1);
    makeBlood(game, 1);
    const forebear = toGraveyard(game, "Falkenrath Forebear");
    pickPermanents(a, ...named(game, BLOOD, A));
    activate(game, forebear, 0);
    expect(zone(game, forebear)).toBe("battlefield");
    expect(game.state.objects[forebear].tapped).toBe(false);
    expect(tokensNamed(game, BLOOD, A)).toBe(0);
  });

  it("can't be activated with one Blood token", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    makeBlood(game, 1);
    const forebear = toGraveyard(game, "Falkenrath Forebear");
    expect(() => activate(game, forebear, 0)).toThrow();
  });
});

describe("Wolfkin Outcast // Wedding Crasher", () => {
  it("costs {2} less while you control a Wolf or Werewolf", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const outcast = toHand(game, "Wolfkin Outcast");
    expect(() => cast(game, outcast)).toThrow();
    spawn(game, "Sporeback Wolf");
    cast(game, outcast);
    expect(zone(game, outcast)).toBe("battlefield");
  });

  it("Wedding Crasher draws when it or another Wolf or Werewolf you control dies, not another creature", () => {
    const { game } = table();
    game.state.dayNight = "night";
    const crasher = enter(game, "Wolfkin Outcast");
    expect(printedCardName(game.state.objects[crasher])).toBe("Wedding Crasher");
    expect(pt(game, crasher)).toEqual({ power: 6, toughness: 5 });
    const wolf = spawn(game, "Sporeback Wolf");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    destroy(game, bears);
    expect(hand(game).length).toBe(before);
    destroy(game, wolf);
    expect(hand(game).length).toBe(before + 1);
    destroy(game, crasher);
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Nature's Embrace", () => {
  it("gives a creature +2/+2", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Nature's Embrace"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("gives a land {T}: Add two mana of any one color", () => {
    const { game } = table();
    const land = spawn(game, "Wastes");
    attachTo(game, spawn(game, "Nature's Embrace"), land);
    expect(keywords(game, land).size).toBe(0);
    // The enchanted Wastes is the only land: it pays {1}{G} alone.
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[land].tapped).toBe(true);
  });
});

describe("Gift of Fangs", () => {
  it("+2/+2 on a Vampire, -2/-2 on anything else", () => {
    const { game } = table();
    const vampire = spawn(game, "Vampire Nighthawk");
    attachTo(game, spawn(game, "Gift of Fangs"), vampire);
    expect(pt(game, vampire)).toEqual({ power: 4, toughness: 5 });
    const giant = spawn(game, "Hill Giant", B);
    attachTo(game, spawn(game, "Gift of Fangs"), giant);
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Ollenbock Escort", () => {
  it("offers only creatures you control with a +1/+1 counter; the target gains lifelink and indestructible", () => {
    const { game } = table();
    const escort = spawn(game, "Ollenbock Escort");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Hill Giant", B);
    game.state.objects[giant].counters["+1/+1"] = 1;
    game.state.objects[theirs].counters["+1/+1"] = 1;
    expect(() => activate(game, escort, 0, { targets: [ref(bears)] })).toThrow();
    expect(() => activate(game, escort, 0, { targets: [ref(theirs)] })).toThrow();
    activate(game, escort, 0, { targets: [ref(giant)] });
    expect(zone(game, escort)).toBe("graveyard");
    expect(keywords(game, giant).has("lifelink")).toBe(true);
    expect(keywords(game, giant).has("indestructible")).toBe(true);
  });
});

describe("Witch's Web", () => {
  it("+3/+3 and reach, and untaps the creature", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    cast(game, toHand(game, "Witch's Web"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("reach")).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Scattered Thoughts", () => {
  it("takes two of the top four and bins the other two", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const one = toLibrary(game, "Grizzly Bears");
    const two = toLibrary(game, "Hill Giant");
    const three = toLibrary(game, "Lightning Bolt");
    const four = toLibrary(game, "Sol Ring");
    pickFromZone(a, four, two);
    cast(game, toHand(game, "Scattered Thoughts"));
    expect(zone(game, four)).toBe("hand");
    expect(zone(game, two)).toBe("hand");
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, three)).toBe("graveyard");
  });
});

describe("Hamlet Vanguard", () => {
  it("enters with two +1/+1 counters for each other nontoken Human you control", () => {
    const { game } = table();
    spawn(game, "Ollenbock Escort"); // Human
    spawn(game, "Ollenbock Escort"); // Human
    spawn(game, "Ollenbock Escort", B); // not yours
    spawn(game, "Grizzly Bears"); // not a Human
    game.debugApplyEffect(A, { kind: "create-token", token: "Human Soldier Token", count: 1 }, []);
    const vanguard = enter(game, "Hamlet Vanguard");
    expect(counters(game, vanguard)).toBe(4);
    expect(pt(game, vanguard)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Desperate Farmer // Depraved Harvester", () => {
  it("transforms when another creature you control dies", () => {
    const { game } = table();
    const farmer = spawn(game, "Desperate Farmer");
    const theirs = spawn(game, "Grizzly Bears", B);
    destroy(game, theirs);
    expect(printedCardName(game.state.objects[farmer])).toBe("Desperate Farmer");
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(printedCardName(game.state.objects[farmer])).toBe("Depraved Harvester");
    expect(pt(game, farmer)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, farmer).has("lifelink")).toBe(true);
  });
});

describe("Sporeback Wolf", () => {
  it("gets +0/+2 during your turn only", () => {
    const { game } = table();
    const wolf = spawn(game, "Sporeback Wolf");
    expect(pt(game, wolf)).toEqual({ power: 2, toughness: 4 });
    toStep(game, "precombat-main", B);
    expect(pt(game, wolf)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Skywarp Skaab", () => {
  it("may exile two creature cards from your graveyard to draw", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const bolt = toGraveyard(game, "Lightning Bolt");
    pickModes(a, 0);
    const seen = pickFromZone(a, bears, giant);
    const before = hand(game).length;
    enter(game, "Skywarp Skaab");
    expect(seen.offered).not.toContain(bolt);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, giant)).toBe("exile");
    expect(hand(game).length).toBe(before + 1);
  });

  it("with one creature card there, nothing is exiled and no draw (rule 608.2d)", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    pickModes(a, 0);
    const before = hand(game).length;
    enter(game, "Skywarp Skaab");
    expect(hand(game).length).toBe(before);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Fleeting Spirit", () => {
  it("{W}, exile three cards from your graveyard: first strike", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const spirit = spawn(game, "Fleeting Spirit");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Lightning Bolt");
    activate(game, spirit, 0);
    expect(keywords(game, spirit).has("first-strike")).toBe(true);
    expect(graveyard(game)).toHaveLength(0);
  });

  it("discard a card: exiled, back at the beginning of the next end step", () => {
    const { game } = table();
    const spirit = spawn(game, "Fleeting Spirit");
    toHand(game, "Grizzly Bears");
    const handBefore = hand(game).length;
    const binnedBefore = graveyard(game).length;
    activate(game, spirit, 1);
    expect(hand(game).length).toBe(handBefore - 1);
    expect(graveyard(game).length).toBe(binnedBefore + 1);
    expect(zone(game, spirit)).toBe("exile");
    toStep(game, "end");
    settle(game);
    const [back] = named(game, "Fleeting Spirit", A);
    expect(back).toBeDefined();
  });
});

describe("Markov Retribution", () => {
  it("both modes: creatures you control get +1/+0, then the Vampire deals its power to another creature", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const vampire = spawn(game, "Vampire Nighthawk");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Markov Retribution"), { modes: [0, 1], targets: [ref(vampire), ref(giant)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    // Nighthawk is 3/3 after the +1/+0 and has deathtouch: the Giant dies.
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("the first target must be a Vampire you control", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    expect(() =>
      cast(game, toHand(game, "Markov Retribution"), { modes: [1], targets: [ref(bears), ref(giant)] }),
    ).toThrow();
  });
});

describe("Vampire Slayer", () => {
  it("destroys a Vampire it deals damage to", () => {
    const { game, a, b } = table();
    const slayer = spawn(game, "Vampire Slayer");
    const vampire = spawn(game, "Vampire Nighthawk", B); // 2/3: survives the 2 damage itself
    b.declareBlockersFn = () => [{ blocker: vampire, attacker: slayer }];
    attack(game, a, [slayer]);
    settle(game);
    expect(zone(game, vampire)).toBe("graveyard");
  });

  it("leaves a non-Vampire it damages alone", () => {
    const { game, a, b } = table();
    const slayer = spawn(game, "Vampire Slayer");
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: slayer }];
    attack(game, a, [slayer]);
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
  });
});
