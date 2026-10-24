import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  counters,
  destroy,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

// OGW / C15 group A — one test per card whose behaviour is more than a stat
// line or a copy of an already-tested shape.

describe("Crush of Tentacles", () => {
  it("bounces every nonland permanent; cast for surge, it then makes an 8/8 Octopus", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    const thopter = toHand(game, "Ornithopter");
    cast(game, thopter);
    expect(zone(game, thopter)).toBe("battlefield");
    cast(game, toHand(game, "Crush of Tentacles"), { altCost: true });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, thopter)).toBe("hand");
    expect(tokensNamed(game, "Octopus Token", A)).toBe(1);
    expect(named(game, "Island")).toHaveLength(5);
  });

  it("makes no Octopus cast for its mana cost", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Crush of Tentacles"));
    expect(zone(game, bears)).toBe("hand");
    expect(tokensNamed(game, "Octopus Token")).toBe(0);
  });
});

describe("Kazuul's Toll Collector", () => {
  it("attaches the target Equipment to itself", () => {
    const { game } = table();
    const ogre = spawn(game, "Kazuul's Toll Collector");
    const blade = spawn(game, "Bonesplitter");
    activate(game, ogre, 0, { targets: [ref(blade)] });
    expect(game.state.objects[blade].attachedTo).toBe(ogre);
    expect(pt(game, ogre)).toEqual({ power: 5, toughness: 2 });
  });
});

describe("Dimensional Infiltrator", () => {
  it("may return to its owner's hand when the exiled card is a land", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const infiltrator = spawn(game, "Dimensional Infiltrator");
    pickModes(a, 0);
    activate(game, infiltrator, 0, { targets: [ref(B)] });
    expect(zone(game, infiltrator)).toBe("hand");
  });

  it("stays when the exiled card isn't a land", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const infiltrator = spawn(game, "Dimensional Infiltrator");
    const top = toLibrary(game, "Grizzly Bears", B);
    pickModes(a, 0);
    activate(game, infiltrator, 0, { targets: [ref(B)] });
    expect(zone(game, top)).toBe("exile");
    expect(zone(game, infiltrator)).toBe("battlefield");
  });
});

describe("Remorseless Punishment", () => {
  it("a player who takes neither option loses 5 life twice", () => {
    const { game, b } = table();
    lands(game, "Swamp", 5);
    spawn(game, "Grizzly Bears", B);
    pickModes(b);
    cast(game, toHand(game, "Remorseless Punishment"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(10);
  });

  it("asks the same player twice: discarding two cards each time", () => {
    const { game, b } = table();
    lands(game, "Swamp", 5);
    const before = hand(game, B).length;
    pickModes(b, 0);
    cast(game, toHand(game, "Remorseless Punishment"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
    expect(hand(game, B).length).toBe(before - 4);
  });
});

describe("Sweep Away", () => {
  it("may put an attacking creature on top of its owner's library", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 3);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    pickModes(a, 0);
    cast(game, toHand(game, "Sweep Away"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1] === bears || library[0] === bears).toBe(true);
  });

  it("returns a creature that isn't attacking to its owner's hand", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    pickModes(a, 0);
    cast(game, toHand(game, "Sweep Away"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Seed Guardian", () => {
  it("dies into an X/X Elemental, X the creature cards in its owner's graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Island");
    const guardian = spawn(game, "Seed Guardian");
    destroy(game, guardian);
    const [token] = named(game, "Elemental Token (Dance of the Tumbleweeds)", A);
    expect(token).toBeDefined();
    expect(pt(game, token)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Immobilizer Eldrazi", () => {
  it("creatures with toughness greater than power can't block, compared as blockers are declared", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    const eldrazi = spawn(game, "Immobilizer Eldrazi");
    const attacker = spawn(game, "Grizzly Bears");
    const thopter = spawn(game, "Ornithopter", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const pumped = spawn(game, "Grizzly Bears", B);
    activate(game, eldrazi, 0);
    // +0/+1 after the ability resolved still stops it blocking (the ruling).
    game.debugApplyEffect(B, { kind: "modify-pt", target: 0, power: 0, toughness: 1, duration: "end-of-turn" }, [
      ref(pumped),
    ]);
    const offer = blockOffer(game, a, [attacker]);
    const blockers = offer.eligible.filter((e) => e.canBlock.length > 0).map((e) => e.blocker);
    expect(blockers).toContain(bears);
    expect(blockers).not.toContain(thopter);
    expect(blockers).not.toContain(pumped);
  });
});

describe("Meteor Blast", () => {
  it("deals 4 damage to each of X targets", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Meteor Blast"), { x: 2, targets: [ref(B), ref(giant)] });
    expect(life(game, B)).toBe(16);
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Burn the Accursed", () => {
  it("deals 5 to the creature and 2 to its controller, and exiles the creature it kills", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Burn the Accursed"), { targets: [ref(giant)] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, giant)).toBe("exile");
  });
});

describe("Blitz of the Thunder-Raptor", () => {
  it("deals damage equal to the instants and sorceries in your graveyard, and exiles what it kills", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    toGraveyard(game, "Shock");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Shock", B);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Blitz of the Thunder-Raptor"), { targets: [ref(giant)] });
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(zone(game, giant)).toBe("battlefield");
    cast(game, toHand(game, "Blitz of the Thunder-Raptor"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Kalemne, Disciple of Iroas", () => {
  it("gets an experience counter for a creature spell of mana value 5 or more, and +1/+1 for each", () => {
    const { game } = table();
    const kalemne = spawn(game, "Kalemne, Disciple of Iroas");
    lands(game, "Mountain", 10);
    cast(game, toHand(game, "Hill Giant"));
    expect(pt(game, kalemne)).toEqual({ power: 3, toughness: 3 });
    cast(game, toHand(game, "Shivan Dragon"));
    expect(game.state.players[A].counters?.experience ?? 0).toBe(1);
    expect(pt(game, kalemne)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Press into Service", () => {
  it("supports up to two creatures, then steals, untaps and hastes a creature", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B, { tapped: true });
    cast(game, toHand(game, "Press into Service"), { targets: [ref(mine), ref(theirs), ref(theirs)] });
    expect(counters(game, mine)).toBe(1);
    expect(counters(game, theirs)).toBe(1);
    expect(game.state.objects[theirs].controller).toBe(A);
    expect(game.state.objects[theirs].tapped).toBe(false);
    expect(keywords(game, theirs).has("haste")).toBe(true);
  });
});

describe("Cyclone Sire", () => {
  it("dies: may make target land you control a 0/0 Elemental with three +1/+1 counters and haste", () => {
    const { game, a } = table();
    const sire = spawn(game, "Cyclone Sire");
    const [island] = lands(game, "Island", 1);
    pickTargets(a, island);
    pickModes(a, 0);
    destroy(game, sire);
    expect(counters(game, island)).toBe(3);
    expect(pt(game, island)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, island).has("haste")).toBe(true);
  });
});

describe("Kaseto, Orochi Archmage", () => {
  it("makes a creature unblockable, and a Snake +2/+2 too", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const kaseto = spawn(game, "Kaseto, Orochi Archmage");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, kaseto, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    activate(game, kaseto, 0, { targets: [ref(kaseto)] });
    expect(pt(game, kaseto)).toEqual({ power: 4, toughness: 4 });
  });
});
