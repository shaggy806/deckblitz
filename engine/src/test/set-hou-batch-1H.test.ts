import { describe, expect, it } from "vitest";
import {
  A,
  B,
  C,
  activate,
  attack,
  blockOffer,
  cast,
  destroy,
  enter,
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
  toGraveyard,
  toHand,
  toLibrary,
  types,
  zone,
} from "./harness.js";

describe("Banewhip Punisher", () => {
  it("puts a -1/-1 counter on enter, then destroys only a creature with one", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, giant);
    const punisher = enter(game, "Banewhip Punisher");
    expect(game.state.objects[giant].counters["-1/-1"]).toBe(1);
    lands(game, "Swamp", 1);
    expect(() => activate(game, punisher, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, punisher, 0, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, punisher)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Uncage the Menagerie", () => {
  it("finds only creature cards with mana value X", () => {
    const { game, a } = table();
    const courser = toLibrary(game, "Centaur Courser");
    const elves = toLibrary(game, "Llanowar Elves");
    const wolf = toLibrary(game, "Watchwolf");
    const bears = toLibrary(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    const seen = pickFromZone(a, bears, wolf);
    cast(game, toHand(game, "Uncage the Menagerie"), { x: 2 });
    expect(seen.offered).toContain(bears);
    expect(seen.offered).toContain(wolf);
    expect(seen.offered).not.toContain(courser);
    expect(seen.offered).not.toContain(elves);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, wolf)).toBe("hand");
  });
});

describe("Wildfire Eternal", () => {
  it("unblocked, casts a sorcery from hand for free mid-combat", () => {
    const { game, a } = table();
    const eternal = spawn(game, "Wildfire Eternal");
    const divination = toHand(game, "Divination");
    a.chooseCastNowFn = (_v, offer) =>
      offer.cards.includes(divination)
        ? { type: "cast-spell", player: A, card: divination, targets: [], via: "effect", free: true }
        : null;
    const before = hand(game).length;
    attack(game, a, [eternal]);
    expect(zone(game, divination)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1 + 2);
    expect(life(game, B)).toBe(19);
  });
});

describe("Life Goes On", () => {
  it("gains 4, or 8 if a creature died this turn", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Life Goes On"));
    expect(life(game, A)).toBe(24);
    destroy(game, spawn(game, "Grizzly Bears", B));
    cast(game, toHand(game, "Life Goes On"));
    expect(life(game, A)).toBe(32);
  });
});

describe("Vile Manifestation", () => {
  it("gets +1/+0 for each card with cycling in your graveyard", () => {
    const { game } = table();
    const vile = spawn(game, "Vile Manifestation");
    toGraveyard(game, "Djeru's Renunciation");
    toGraveyard(game, "Vile Manifestation");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Djeru's Renunciation", B);
    expect(pt(game, vile)).toEqual({ power: 2, toughness: 4 });
  });
});

describe("Blur of Blades", () => {
  it("puts a -1/-1 counter on the creature and deals 2 to its controller", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Blur of Blades"), { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

describe("Jace's Defeat", () => {
  it("counters a blue spell and scries 2 only if it was a Jace planeswalker spell", () => {
    const { game, a } = table();
    let scried = 0;
    a.chooseScryFn = () => {
      scried += 1;
      return [];
    };
    lands(game, "Island", 10);
    const divination = toHand(game, "Divination");
    cast(game, divination, { settle: false });
    cast(game, toHand(game, "Jace's Defeat"), { targets: [ref(divination)] });
    expect(zone(game, divination)).toBe("graveyard");
    expect(scried).toBe(0);
    const jace = toHand(game, "Jace Beleren");
    cast(game, jace, { settle: false });
    cast(game, toHand(game, "Jace's Defeat"), { targets: [ref(jace)] });
    expect(zone(game, jace)).toBe("graveyard");
    expect(scried).toBe(1);
  });
});

describe("Dagger of the Worthy", () => {
  it("gives +2/+0 and afflict 1", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const dagger = spawn(game, "Dagger of the Worthy");
    lands(game, "Wastes", 2);
    activate(game, dagger, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    b.declareBlockersFn = () => [{ blocker: giant, attacker: bears }];
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(19);
  });
});

describe("Riddleform", () => {
  it("may become a 3/3 flying Sphinx when you cast a noncreature spell", () => {
    const { game, a } = table();
    const riddle = spawn(game, "Riddleform");
    pickModes(a, 0);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Divination"));
    expect(types(game, riddle)).toContain("creature");
    expect(types(game, riddle)).toContain("enchantment");
    expect(pt(game, riddle)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, riddle).has("flying")).toBe(true);
  });
});

describe("Ominous Sphinx", () => {
  it("cycling a card gives target creature an opponent controls -2/-0", () => {
    const { game, a } = table();
    spawn(game, "Ominous Sphinx");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Plains", 1);
    pickTargets(a, giant);
    const djeru = toHand(game, "Djeru's Renunciation");
    game.dispatch({ type: "cycle", player: A, card: djeru });
    settle(game);
    expect(zone(game, djeru)).toBe("graveyard");
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 3 });
  });
});

describe("Solitary Camel", () => {
  it("has lifelink only with a Desert on the battlefield or in your graveyard", () => {
    const { game } = table();
    const camel = spawn(game, "Solitary Camel");
    expect(keywords(game, camel).has("lifelink")).toBe(false);
    toGraveyard(game, "Ifnir Deadlands", B);
    expect(keywords(game, camel).has("lifelink")).toBe(false);
    toGraveyard(game, "Ifnir Deadlands");
    expect(keywords(game, camel).has("lifelink")).toBe(true);
  });
});

describe("Resolute Survivors", () => {
  it("exerted as it attacks, deals 1 to each opponent and you gain 1", () => {
    const { game, a } = table({ players: 3 });
    const survivors = spawn(game, "Resolute Survivors");
    pickModes(a, 0);
    attack(game, a, [survivors]);
    expect(game.state.objects[survivors].exertedBy).toBe(A);
    expect(life(game, B)).toBe(20 - 3 - 1);
    expect(life(game, C)).toBe(19);
    expect(life(game, A)).toBe(21);
  });
});

describe("Marauding Boneslasher", () => {
  it("can't block unless you control another Zombie", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Marauding Boneslasher", B);
    // Its only would-be blocker can't block, so bob has no block to declare.
    expect(() => blockOffer(game, a, [bears])).toThrow(/wasn't asked to block/);
  });

  it("can block with another Zombie", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const slasher = spawn(game, "Marauding Boneslasher", B);
    spawn(game, "Walking Corpse", B);
    const offer = blockOffer(game, a, [bears]);
    expect(offer.eligible.some((e) => e.blocker === slasher && e.canBlock.includes(bears))).toBe(true);
  });
});

describe("Unquenchable Thirst", () => {
  it("taps the creature only with a Desert", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Unquenchable Thirst"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(false);
    const giant = spawn(game, "Hill Giant", B);
    spawn(game, "Ifnir Deadlands");
    cast(game, toHand(game, "Unquenchable Thirst"), { targets: [ref(giant)] });
    expect(game.state.objects[giant].tapped).toBe(true);
  });
});
