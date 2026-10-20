/**
 * Kamigawa: Neon Dynasty, group a. One test (or two) per card, on its
 * riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
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
  pickPermanents,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
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

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

const attachTo = (game: Game, attachment: ObjectId, host: ObjectId): void => {
  game.state.objects[attachment].attachedTo = host;
};

/** `attackers` attack (Bob by default); the game stops in the declare blockers step. */
function toBlocks(game: Game, seat: ScriptedController, attackers: readonly ObjectId[], defender: PlayerId = B): void {
  seat.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender }));
  toStep(game, "declare-blockers");
}

describe("Release to Memory", () => {
  it("exiles the opponent's graveyard and makes a Spirit per creature card exiled", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Hill Giant", B);
    toGraveyard(game, "Lightning Bolt", B);
    cast(game, toHand(game, "Release to Memory"), { targets: [ref(B)] });
    expect(graveyard(game, B)).toHaveLength(0);
    expect(tokensNamed(game, "Spirit Token (Colorless)", A)).toBe(2);
  });
});

describe("Smoke Spirits' Aid", () => {
  it("attaches a Smoke Blessing to each target; one dying hurts its controller and makes you a Treasure", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Smoke Spirits' Aid"), { x: 2, targets: [ref(bears), ref(giant)] });
    const blessings = named(game, "Smoke Blessing Token");
    expect(blessings).toHaveLength(2);
    expect(blessings.map((id) => game.state.objects[id].attachedTo).sort()).toEqual([bears, giant].sort());
    expect(blessings.every((id) => game.state.objects[id].controller === A)).toBe(true);
    destroy(game, giant);
    // The Giant deals 1 to Bob, its controller; Alice, the Blessing's controller, gets the Treasure.
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Kosei, Penitent Warlord", () => {
  const setUp = (withCounter: boolean) => {
    const t = table({ players: 3 });
    const kosei = spawn(t.game, "Kosei, Penitent Warlord");
    attachTo(t.game, spawn(t.game, "Holy Strength"), kosei);
    attachTo(t.game, spawn(t.game, "Bonesplitter"), kosei);
    if (withCounter) t.game.state.objects[kosei].counters["+1/+1"] = 1;
    return { ...t, kosei };
  };

  it("enchanted, equipped and with a counter: draws that many and hits each other opponent", () => {
    const { game, a, kosei } = setUp(true);
    // 0/5 + Holy Strength +1/+2 + Bonesplitter +2/+0 + a +1/+1 counter.
    expect(pt(game, kosei)).toEqual({ power: 4, toughness: 8 });
    const before = hand(game).length;
    attack(game, a, [kosei]);
    settle(game);
    expect(life(game, B)).toBe(16);
    expect(life(game, C)).toBe(16);
    expect(hand(game).length).toBe(before + 4);
  });

  it("without a counter it doesn't have the ability", () => {
    const { game, a, kosei } = setUp(false);
    const before = hand(game).length;
    attack(game, a, [kosei]);
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(20);
    expect(hand(game).length).toBe(before);
  });
});

describe("Invoke Despair", () => {
  it("each edict the opponent can't obey costs them 2 life and draws you a card", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    const jace = spawn(game, "Jace Beleren", B);
    const before = hand(game).length;
    cast(game, toHand(game, "Invoke Despair"), { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, jace)).toBe("graveyard");
    // No enchantment: one penalty.
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(before + 1);
  });

  it("an enchantment creature given to the creature edict doesn't also answer the enchantment one", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const keeper = spawn(game, "Akki Ember-Keeper", B);
    const before = hand(game).length;
    cast(game, toHand(game, "Invoke Despair"), { targets: [ref(B)] });
    expect(zone(game, keeper)).toBe("graveyard");
    // No enchantment left, and no planeswalker: two penalties.
    expect(life(game, B)).toBe(16);
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Reality Heist", () => {
  it("costs {1} less per artifact and takes up to two artifacts from the top seven", () => {
    const { game, a } = table();
    spawn(game, "Ornithopter");
    spawn(game, "Ornithopter");
    lands(game, "Island", 5);
    const ring = toLibrary(game, "Sol Ring");
    const bears = toLibrary(game, "Grizzly Bears");
    const memnite = toLibrary(game, "Memnite");
    const seen = pickFromZone(a, memnite, ring);
    cast(game, toHand(game, "Reality Heist"));
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, ring)).toBe("hand");
    expect(zone(game, memnite)).toBe("hand");
    // The rest went to the bottom.
    expect(library(game).slice(-5)).toContain(bears);
  });
});

describe("High-Speed Hoverbike", () => {
  it("taps up to one target creature as it enters", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "High-Speed Hoverbike");
    expect(game.state.objects[giant].tapped).toBe(true);
  });

  it("crew 1 makes it a 2/2 flying artifact creature", () => {
    const { game, a } = table();
    const bike = spawn(game, "High-Speed Hoverbike");
    const memnite = spawn(game, "Memnite");
    pickPermanents(a, memnite);
    activate(game, bike, 0);
    expect(types(game, bike)).toContain("creature");
    expect(keywords(game, bike).has("flying")).toBe(true);
    expect(game.state.objects[memnite].tapped).toBe(true);
  });
});

describe("Tameshi, Reality Architect", () => {
  it("draws once a turn when noncreature permanents are returned to hand, not for creatures", () => {
    const { game } = table();
    spawn(game, "Tameshi, Reality Architect");
    const bears = spawn(game, "Grizzly Bears");
    const ring = spawn(game, "Sol Ring");
    const stone = spawn(game, "Mind Stone", B);
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0 }, [ref(bears)]);
    settle(game);
    expect(hand(game).length).toBe(before + 1); // just the Bears
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0 }, [ref(ring)]);
    settle(game);
    expect(hand(game).length).toBe(before + 3); // the Ring and a draw
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0 }, [ref(stone)]);
    settle(game);
    expect(hand(game).length).toBe(before + 3); // once each turn
  });

  it("returns an artifact with mana value X or less; the land it returns triggers the draw", () => {
    const { game, a } = table();
    const tameshi = spawn(game, "Tameshi, Reality Architect");
    const plains = lands(game, "Plains", 4);
    const stone = toGraveyard(game, "Mind Stone");
    expect(() => activate(game, tameshi, 0, { x: 1, targets: [ref(stone)] })).toThrow();
    pickPermanents(a, plains[3]);
    const before = hand(game).length;
    activate(game, tameshi, 0, { x: 2, targets: [ref(stone)] });
    expect(zone(game, stone)).toBe("battlefield");
    expect(zone(game, plains[3])).toBe("hand");
    expect(hand(game).length).toBe(before + 2); // the Plains and a draw
  });
});

describe("Shrine Steward", () => {
  it("may search for an Aura or a Shrine", () => {
    const { game, a } = table();
    toLibrary(game, "Grizzly Bears");
    const strength = toLibrary(game, "Holy Strength");
    const shintai = toLibrary(game, "Go-Shintai of Ancient Wars");
    pickModes(a, 0);
    const seen = pickFromZone(a, shintai);
    enter(game, "Shrine Steward");
    expect([...seen.offered].sort()).toEqual([strength, shintai].sort());
    expect(zone(game, shintai)).toBe("hand");
  });
});

describe("Light the Way", () => {
  it("puts a +1/+1 counter on a Vehicle that isn't a creature, and untaps it", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bike = spawn(game, "High-Speed Hoverbike", A, { tapped: true });
    cast(game, toHand(game, "Light the Way"), { modes: [0], targets: [ref(bike)] });
    expect(counters(game, bike)).toBe(1);
    expect(game.state.objects[bike].tapped).toBe(false);
  });

  it("returns a permanent you control to its owner's hand", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const ring = spawn(game, "Sol Ring");
    cast(game, toHand(game, "Light the Way"), { modes: [1], targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("hand");
  });
});

describe("Kitsune Ace", () => {
  const crewedBike = (game: Game, a: ScriptedController): ObjectId => {
    const bike = spawn(game, "High-Speed Hoverbike");
    const memnite = spawn(game, "Memnite");
    pickPermanents(a, memnite);
    activate(game, bike, 0);
    return bike;
  };

  it("an attacking Vehicle gains first strike", () => {
    const { game, a } = table();
    spawn(game, "Kitsune Ace");
    const bike = crewedBike(game, a);
    pickModes(a, 0);
    attack(game, a, [bike]);
    expect(keywords(game, bike).has("first-strike")).toBe(true);
  });

  it("or untaps the Ace", () => {
    const { game, a } = table();
    const bike = crewedBike(game, a);
    const ace = spawn(game, "Kitsune Ace");
    pickModes(a, 1);
    attack(game, a, [bike, ace]);
    expect(game.state.objects[ace].tapped).toBe(false);
    expect(keywords(game, bike).has("first-strike")).toBe(false);
  });
});

describe("Akki War Paint", () => {
  it("+2/+1 to a creature; nothing to a noncreature artifact until it becomes one", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Akki War Paint"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });

    const bike = spawn(game, "High-Speed Hoverbike");
    attachTo(game, spawn(game, "Akki War Paint"), bike);
    expect(types(game, bike)).not.toContain("creature");
    pickPermanents(a, spawn(game, "Memnite"));
    activate(game, bike, 0);
    expect(pt(game, bike)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("The Modern Age", () => {
  it("I loots; III returns it transformed as Vector Glider", () => {
    const { game } = table();
    const saga = spawn(game, "The Modern Age");
    settle(game);
    const chapters = registryOf(game).get("The Modern Age").chapters!;
    const before = hand(game).length;
    const binned = graveyard(game).length;
    game.debugApplyEffect(A, chapters[0].effect!, [], { source: saga });
    settle(game);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game)).toHaveLength(binned + 1);
    game.debugApplyEffect(A, chapters[1].effect!, [], { source: saga });
    settle(game);
    const [glider] = named(game, "The Modern Age");
    expect(game.state.objects[glider].face).toBe(1);
    expect(types(game, glider)).toEqual(expect.arrayContaining(["enchantment", "creature"]));
    expect(keywords(game, glider).has("flying")).toBe(true);
    expect(pt(game, glider)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Papercraft Decoy", () => {
  it("leaving the battlefield (not only dying) offers {2} for a card", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const decoy = spawn(game, "Papercraft Decoy");
    pickModes(a, 0);
    const before = hand(game).length;
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(decoy)]);
    settle(game);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Blade-Blizzard Kitsune", () => {
  it("ninjutsu {3}{W}, and it deals double strike damage", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    const ninja = toHand(game, "Blade-Blizzard Kitsune");
    toBlocks(game, a, [bears]);
    activate(game, ninja, 0, { settle: false });
    toStep(game, "postcombat-main");
    expect(zone(game, ninja)).toBe("battlefield");
    expect(zone(game, bears)).toBe("hand");
    expect(life(game, B)).toBe(16);
  });
});

describe("Coiling Stalker", () => {
  it("offers only creatures you control without a +1/+1 counter", () => {
    const { game, a } = table();
    const stalker = spawn(game, "Coiling Stalker");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    game.state.objects[giant].counters["+1/+1"] = 1;
    const seen = watchTargets(a, () => [bears]);
    attack(game, a, [stalker]);
    settle(game);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(giant);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Akki Ember-Keeper", () => {
  it("a nontoken creature with a counter dying makes a Spirit; an unmodified one doesn't", () => {
    const { game } = table();
    spawn(game, "Akki Ember-Keeper");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    game.state.objects[giant].counters["+1/+1"] = 1;
    destroy(game, bears);
    expect(tokensNamed(game, "Spirit Token (Colorless)")).toBe(0);
    destroy(game, giant);
    expect(tokensNamed(game, "Spirit Token (Colorless)")).toBe(1);
  });

  it("an opponent's Aura doesn't make your creature modified", () => {
    const { game } = table();
    spawn(game, "Akki Ember-Keeper");
    const bears = spawn(game, "Grizzly Bears");
    attachTo(game, spawn(game, "Pacifism", B), bears);
    destroy(game, bears);
    expect(tokensNamed(game, "Spirit Token (Colorless)")).toBe(0);
  });
});

describe("Runaway Trash-Bot", () => {
  it("+1/+0 per artifact and/or enchantment card in your graveyard, not an opponent's", () => {
    const { game } = table();
    const bot = spawn(game, "Runaway Trash-Bot");
    toGraveyard(game, "Sol Ring");
    toGraveyard(game, "Glorious Anthem");
    toGraveyard(game, "Ornithopter");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Mind Stone", B);
    expect(pt(game, bot)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Saiba Trespassers", () => {
  it("channel taps up to two creatures you don't control, which skip their next untap", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const card = toHand(game, "Saiba Trespassers");
    activate(game, card, 0, { targets: [ref(bears), ref(giant)] });
    expect(zone(game, card)).toBe("graveyard");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[giant].tapped).toBe(true);
    toStep(game, "precombat-main", B);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[giant].tapped).toBe(true);
  });

  it("can't target your own creature", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const mine = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Saiba Trespassers");
    expect(() => activate(game, card, 0, { targets: [ref(mine), null] })).toThrow();
  });
});

describe("Kami of Terrible Secrets", () => {
  it("with an artifact and an enchantment, draws a card and gains 1 life", () => {
    const { game } = table();
    spawn(game, "Sol Ring");
    spawn(game, "Glorious Anthem");
    const before = hand(game).length;
    enter(game, "Kami of Terrible Secrets");
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(21);
  });

  it("with only an artifact, nothing", () => {
    const { game } = table();
    spawn(game, "Sol Ring");
    const before = hand(game).length;
    enter(game, "Kami of Terrible Secrets");
    expect(hand(game).length).toBe(before);
    expect(life(game)).toBe(20);
  });
});

describe("Jukai Trainee", () => {
  it("gets +1/+1 when it becomes blocked", () => {
    const { game, a, b } = table();
    const trainee = spawn(game, "Jukai Trainee");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: trainee }];
    attack(game, a, [trainee]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, trainee)).toBe("battlefield");
    expect(pt(game, trainee)).toEqual({ power: 3, toughness: 3 });
  });

  it("and when it blocks", () => {
    const { game, a, b } = table();
    const trainee = spawn(game, "Jukai Trainee");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    a.declareBlockersFn = () => [{ blocker: trainee, attacker: bears }];
    toStep(game, "postcombat-main", B);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, trainee)).toBe("battlefield");
    expect(pt(game, trainee)).toEqual({ power: 3, toughness: 3 });
  });
});
