/**
 * Set walk batch 80, part c (2026-10-15): Marvel's Spider-Man (SPM), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

/** `id` becomes an artifact creature until end of turn — a crewed Vehicle. */
const crewed = (game: Game, id: ObjectId): void =>
  game.debugApplyEffect(A, { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" }, [
    ref(id),
  ]);

describe("Mob Lookout", () => {
  it("has a creature you control connive as it enters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const bolt = toHand(game, "Lightning Bolt");
    const before = hand(game).length;
    a.chooseDiscardsFn = () => [bolt];
    pickTargets(a, bears);
    enter(game, "Mob Lookout");
    expect(counters(game, bears)).toBe(1);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before);
  });

  it("puts no counter on it when the discard is a land", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const forest = toHand(game, "Forest");
    a.chooseDiscardsFn = () => [forest];
    pickTargets(a, bears);
    enter(game, "Mob Lookout");
    expect(counters(game, bears)).toBe(0);
    expect(zone(game, forest)).toBe("graveyard");
  });
});

describe("Selfless Police Captain", () => {
  it("enters with a +1/+1 counter, and passes on only its +1/+1 counters as it leaves", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Wastes", 1);
    const bears = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Selfless Police Captain");
    cast(game, card);
    expect(counters(game, card)).toBe(1);
    expect(pt(game, card)).toEqual({ power: 2, toughness: 2 });
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(card)]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "charge", amount: 2 }, [ref(card)]);
    pickTargets(a, bears);
    destroy(game, card);
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, bears, "charge")).toBe(0);
  });

  it("triggers on any way off the battlefield — bounced too", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Wastes", 1);
    const bears = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Selfless Police Captain");
    cast(game, card);
    pickTargets(a, bears);
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(card)]);
    settle(game);
    expect(zone(game, card)).toBe("hand");
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Inner Demons Gangsters", () => {
  it("discards a card to get +1/+0 and menace until end of turn, as a sorcery", () => {
    const { game, a } = table();
    const gangsters = spawn(game, "Inner Demons Gangsters");
    const junk = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [junk];
    activate(game, gangsters);
    expect(zone(game, junk)).toBe("graveyard");
    expect(pt(game, gangsters)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, gangsters).has("menace")).toBe(true);
    toStep(game, "begin-combat");
    expect(() => activate(game, gangsters)).toThrow();
    nextTurn(game);
    expect(pt(game, gangsters)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, gangsters).has("menace")).toBe(false);
  });
});

describe("Spider-Mobile", () => {
  it("gets +1/+1 for each Spider you control as it attacks", () => {
    const { game, a } = table();
    const mobile = spawn(game, "Spider-Mobile");
    spawn(game, "Giant Spider");
    spawn(game, "Giant Spider");
    spawn(game, "Giant Spider", B);
    crewed(game, mobile);
    attack(game, a, [mobile]);
    expect(pt(game, mobile)).toEqual({ power: 5, toughness: 5 });
    expect(life(game, B)).toBe(15);
  });

  it("gets the bonus as it blocks too", () => {
    const { game, a, b } = table();
    const mobile = spawn(game, "Spider-Mobile");
    spawn(game, "Giant Spider");
    nextTurn(game);
    const bears = spawn(game, "Grizzly Bears", B);
    crewed(game, mobile);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    a.declareBlockersFn = () => [{ blocker: mobile, attacker: bears }];
    toStep(game, "postcombat-main", B);
    expect(pt(game, mobile)).toEqual({ power: 4, toughness: 4 });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Living Brain, Mechanical Marvel", () => {
  it("makes a non-Equipment artifact you control an untapped 3/3 creature until end of turn", () => {
    const { game, a } = table();
    const brain = spawn(game, "Living Brain, Mechanical Marvel");
    const ring = spawn(game, "Sol Ring", A, { tapped: true });
    const splitter = spawn(game, "Bonesplitter");
    spawn(game, "Mind Stone", B);
    const seen = watchTargets(a, () => [ring]);
    toStep(game, "begin-combat");
    settle(game);
    expect(seen.offered[0]).toContain(ring);
    expect(seen.offered[0]).toContain(brain);
    expect(seen.offered[0]).not.toContain(splitter);
    expect(seen.offered[0]).toHaveLength(2);
    expect(types(game, ring)).toContain("creature");
    expect(pt(game, ring)).toEqual({ power: 3, toughness: 3 });
    expect(game.state.objects[ring].tapped).toBe(false);
    nextTurn(game);
    expect(types(game, ring)).not.toContain("creature");
  });
});

describe("Daily Bugle Reporters", () => {
  it("Puff Piece: a +1/+1 counter on each of up to two target creatures", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, bears, theirs);
    enter(game, "Daily Bugle Reporters");
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, theirs)).toBe(1);
  });

  it("Investigative Journalism: returns a creature card with mana value 2 or less", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const thopter = toGraveyard(game, "Ornithopter");
    const giant = toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Mind Stone");
    toGraveyard(game, "Grizzly Bears", B);
    pickModes(a, 1);
    const seen = watchTargets(a, () => [bears]);
    enter(game, "Daily Bugle Reporters");
    expect([...seen.offered[0]].sort()).toEqual([bears, thopter].sort());
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Subway Train", () => {
  it("may pay {G} as it enters to fetch a basic land card to hand", () => {
    const { game, a } = table();
    const forest = lands(game, "Forest", 1)[0];
    const basic = toLibrary(game, "Forest");
    pickModes(a, 0);
    pickFromZone(a, basic);
    enter(game, "Subway Train");
    expect(zone(game, basic)).toBe("hand");
    expect(game.state.objects[forest].tapped).toBe(true);
  });

  it("does nothing when you don't pay", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const basic = toLibrary(game, "Forest");
    pickModes(a);
    enter(game, "Subway Train");
    expect(zone(game, basic)).toBe("library");
  });
});

describe("Beetle, Legacy Criminal", () => {
  it("exiles itself from your graveyard to put a +1/+1 counter on a creature and give it flying", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Wastes", 1);
    const beetle = toGraveyard(game, "Beetle, Legacy Criminal");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, beetle, 0, { targets: [ref(bears)] });
    expect(zone(game, beetle)).toBe("exile");
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("flying")).toBe(true);
    nextTurn(game);
    expect(keywords(game, bears).has("flying")).toBe(false);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Wild Pack Squad", () => {
  it("gives up to one target creature first strike and vigilance at your beginning of combat", () => {
    const { game, a } = table();
    spawn(game, "Wild Pack Squad");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("vigilance")).toBe(true);
  });

  it("may choose no target", () => {
    const { game, a } = table();
    const squad = spawn(game, "Wild Pack Squad");
    pickTargets(a, null);
    toStep(game, "begin-combat");
    settle(game);
    expect(keywords(game, squad).has("first-strike")).toBe(false);
  });
});

describe("Passenger Ferry", () => {
  it("may pay {U} as it attacks to make another attacking creature unblockable", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const ferry = spawn(game, "Passenger Ferry");
    crewed(game, ferry);
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Giant Spider", B);
    pickModes(a, 0);
    const seen = watchTargets(a, () => [bears]);
    const offer = blockOffer(game, a, [ferry, bears, other]);
    expect([...seen.offered[0]].sort()).toEqual([bears, other].sort());
    const canBlock = offer.eligible.find((e) => e.blocker === wall)?.canBlock ?? [];
    expect(canBlock).toContain(ferry);
    expect(canBlock).toContain(other);
    expect(canBlock).not.toContain(bears);
  });
});

describe("Stegron the Dinosaur Man", () => {
  it("discards itself to give a creature you control +3/+1 and make it a Dinosaur until end of turn", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 1);
    const stegron = toHand(game, "Stegron the Dinosaur Man");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, stegron, 0, { targets: [ref(bears)] });
    expect(zone(game, stegron)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 3 });
    expect(subtypes(game, bears)).toEqual(expect.arrayContaining(["Bear", "Dinosaur"]));
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(subtypes(game, bears)).not.toContain("Dinosaur");
  });
});

describe("Shocker, Unshakable", () => {
  it("deals 2 damage to a creature and 2 to its controller as he enters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Shocker, Unshakable");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });

  it("has first strike only during your turn", () => {
    const { game } = table();
    const shocker = spawn(game, "Shocker, Unshakable");
    expect(keywords(game, shocker).has("first-strike")).toBe(true);
    nextTurn(game);
    expect(keywords(game, shocker).has("first-strike")).toBe(false);
  });
});

describe("Kraven, Proud Predator", () => {
  it("has power equal to the greatest mana value among permanents you control", () => {
    const { game } = table();
    const kraven = spawn(game, "Kraven, Proud Predator");
    expect(pt(game, kraven)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, kraven).has("vigilance")).toBe(true);
    spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears");
    expect(pt(game, kraven).power).toBe(3);
    spawn(game, "Hedron Archive");
    expect(pt(game, kraven)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Angry Rabble", () => {
  it("pings each opponent when you cast a spell with mana value 4 or greater", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Angry Rabble");
    lands(game, "Wastes", 6);
    cast(game, toHand(game, "Mind Stone"));
    expect(life(game, B)).toBe(20);
    cast(game, toHand(game, "Hedron Archive"));
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(19);
    expect(life(game, A)).toBe(20);
  });

  it("{5}{R}: two +1/+1 counters, as a sorcery", () => {
    const { game } = table();
    const rabble = spawn(game, "Angry Rabble");
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 5);
    activate(game, rabble);
    expect(counters(game, rabble)).toBe(2);
  });
});

describe("Lurking Lizards", () => {
  it("gets a +1/+1 counter when you cast a spell with mana value 4 or greater", () => {
    const { game } = table();
    const lizards = spawn(game, "Lurking Lizards");
    lands(game, "Wastes", 6);
    cast(game, toHand(game, "Mind Stone"));
    expect(counters(game, lizards)).toBe(0);
    cast(game, toHand(game, "Hedron Archive"));
    expect(counters(game, lizards)).toBe(1);
  });
});

describe("Spider-Slayer, Hatred Honed", () => {
  it("destroys a Spider it deals damage to, and not another creature", () => {
    const { game, a, b } = table();
    const slayer = spawn(game, "Spider-Slayer, Hatred Honed");
    const spider = spawn(game, "Giant Spider", B);
    b.declareBlockersFn = () => [{ blocker: spider, attacker: slayer }];
    attack(game, a, [slayer]);
    expect(zone(game, spider)).toBe("graveyard");
    expect(zone(game, slayer)).toBe("graveyard");
  });

  it("leaves a non-Spider it damages alone", () => {
    const { game, a, b } = table();
    const slayer = spawn(game, "Spider-Slayer, Hatred Honed");
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: slayer }];
    attack(game, a, [slayer]);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("exiles itself from your graveyard for two tapped flying Robots", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const slayer = toGraveyard(game, "Spider-Slayer, Hatred Honed");
    activate(game, slayer);
    expect(zone(game, slayer)).toBe("exile");
    expect(tokensNamed(game, "Robot Token (Flying)", A)).toBe(2);
    const robot = game.battlefield.find((id) => game.state.objects[id].cardName === "Robot Token (Flying)")!;
    expect(game.state.objects[robot].tapped).toBe(true);
    expect(keywords(game, robot).has("flying")).toBe(true);
    expect(pt(game, robot)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Robotics Mastery", () => {
  it("has flash, makes two flying Robots and gives the creature +2/+2", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Wastes", 4);
    const bears = spawn(game, "Grizzly Bears");
    const aura = toHand(game, "Robotics Mastery");
    toStep(game, "begin-combat");
    cast(game, aura, { targets: [ref(bears)] });
    expect(zone(game, aura)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(tokensNamed(game, "Robot Token (Flying)", A)).toBe(2);
  });
});

describe("Starling, Aerial Ally", () => {
  it("gives another creature you control flying until end of turn as she enters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [bears]);
    const starling = enter(game, "Starling, Aerial Ally");
    expect([...seen.offered[0]].sort()).toEqual([bears, other].sort());
    expect(seen.offered[0]).not.toContain(starling);
    expect(keywords(game, other).has("flying")).toBe(false);
    expect(keywords(game, bears).has("flying")).toBe(true);
    nextTurn(game);
    expect(keywords(game, bears).has("flying")).toBe(false);
  });
});

describe("Professional Wrestler", () => {
  it("makes a Treasure as it enters and can't be blocked by more than one creature", () => {
    const { game, a } = table();
    const wrestler = enter(game, "Professional Wrestler");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    const bears = spawn(game, "Grizzly Bears");
    const offer = blockOffer(game, a, [wrestler, bears]);
    expect([...(offer.singleBlockerAttackers ?? [])]).toEqual([wrestler]);
  });
});
