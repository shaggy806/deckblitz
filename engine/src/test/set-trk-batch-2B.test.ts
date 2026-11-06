/**
 * Star Trek (TRK) — group B of the second preview-card batch: Federation's
 * creature-type count, Strange new worlds' cost reductions, graveyard-leave
 * drains, Combadge's Communicator check and the delayed and conditional
 * clauses of the set's commons.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

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
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

type Game = ReturnType<typeof table>["game"];

const tap = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(id)]);
  settle(game);
};
const untap = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(id)]);
  settle(game);
};

describe("A Good Day to Die", () => {
  it("draws a card when the pumped creature dies this turn", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "A Good Day to Die"), { targets: [ref(bears)] });
    expect(pt(game, bears).power).toBe(4);
    const before = hand(game).length;
    destroy(game, bears);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Beckett Mariner, Impetuous Ensign", () => {
  it("deals 2 to each opponent on the third tap and removes the promotion counters", () => {
    const { game } = table();
    const beckett = spawn(game, "Beckett Mariner, Impetuous Ensign");
    tap(game, beckett);
    untap(game, beckett);
    tap(game, beckett);
    expect(counters(game, beckett, "promotion")).toBe(2);
    expect(life(game, B)).toBe(20);
    untap(game, beckett);
    tap(game, beckett);
    expect(counters(game, beckett, "promotion")).toBe(0);
    expect(life(game, B)).toBe(18);
  });
});

describe("Blastoneuron", () => {
  it("copies an exiled small creature with haste, sacrificed at end step, and drains as the card leaves", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Blastoneuron");
    expect(zone(game, bears)).toBe("exile");
    const copy = named(game, "Grizzly Bears", A)[0];
    expect(copy).toBeDefined();
    expect(game.state.objects[copy].isToken).toBe(true);
    expect(keywords(game, copy).has("haste")).toBe(true);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
    nextTurn(game);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
  });
});

describe("Combadge", () => {
  it("copies itself as it's cast", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Combadge"));
    expect(named(game, "Combadge", A)).toHaveLength(2);
  });

  it("makes its creature unblockable only while another creature has a Communicator", () => {
    const { game, a } = table();
    const first = spawn(game, "Grizzly Bears");
    const second = spawn(game, "Grizzly Bears");
    const badge1 = spawn(game, "Combadge");
    const badge2 = spawn(game, "Combadge");
    lands(game, "Wastes", 4);
    activate(game, badge1, 0, { targets: [ref(first)] });
    activate(game, badge2, 0, { targets: [ref(first)] });
    // Both Communicators on the attacker itself: no other creature has one.
    attack(game, a, [first]);
    expect(keywords(game, first).has("unblockable")).toBe(false);
    nextTurn(game);
    nextTurn(game);
    lands(game, "Wastes", 2);
    activate(game, badge2, 0, { targets: [ref(second)] });
    attack(game, a, [first]);
    expect(keywords(game, first).has("unblockable")).toBe(true);
  });
});

describe("Common Goal", () => {
  it("works with one creature you control", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Common Goal"), { targets: [ref(giant), null, ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Erica Ortegas, Plucky Pilot", () => {
  it("puts a land from hand onto the battlefield and returns a land at the next end step", () => {
    const { game, a } = table();
    const erica = spawn(game, "Erica Ortegas, Plucky Pilot");
    const forest = toHand(game, "Forest");
    pickFromZone(a, forest);
    pickPermanents(a, forest);
    tap(game, erica);
    expect(zone(game, forest)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(zone(game, forest)).toBe("hand");
  });

  it("returns nothing if no land was put onto the battlefield", () => {
    const { game, a } = table();
    const erica = spawn(game, "Erica Ortegas, Plucky Pilot");
    const wastes = spawn(game, "Wastes");
    toHand(game, "Forest");
    pickFromZone(a);
    pickPermanents(a, wastes);
    tap(game, erica);
    toStep(game, "end");
    settle(game);
    expect(zone(game, wastes)).toBe("battlefield");
  });
});

describe("Gowron, Eager for Battle", () => {
  it("draws and loses 1 only when the sacrificed creature is a Klingon", () => {
    const { game } = table();
    const gowron = spawn(game, "Gowron, Eager for Battle");
    const bears = spawn(game, "Grizzly Bears");
    const klingon = spawn(game, "Klingon Warrior Token");
    const before = hand(game).length;
    activate(game, gowron, 0, { sacrifice: bears });
    expect(keywords(game, gowron).has("trample")).toBe(true);
    expect(hand(game).length).toBe(before);
    expect(life(game, A)).toBe(20);
    activate(game, gowron, 0, { sacrifice: klingon });
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(19);
    // Each creature that died grew him.
    expect(counters(game, gowron)).toBe(2);
  });
});

describe("Gul Dukat, Colonial Prefect", () => {
  it("doubles each opponent's life loss this turn at end step, and you gain that much", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Gul Dukat, Colonial Prefect");
    game.debugApplyEffect(A, { kind: "damage", amount: 3, target: 0 }, [ref(B)]);
    settle(game);
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(14);
    expect(life(game, C)).toBe(20);
    expect(life(game, A)).toBe(23);
  });
});

describe("Holo-Engineer", () => {
  it("makes every token you'd create a 3/3 Illusion instead, not an opponent's", () => {
    const { game } = table();
    enter(game, "Holo-Engineer");
    expect(tokensNamed(game, "Illusion Token 3/3 artifact", A)).toBe(1);
    game.debugApplyEffect(A, { kind: "create-token", token: "Clue Token", count: 2 }, []);
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
    expect(tokensNamed(game, "Illusion Token 3/3 artifact", A)).toBe(3);
    game.debugApplyEffect(B, { kind: "create-token", token: "Clue Token", count: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Clue Token", B)).toBe(1);
  });

  it("replaces a token copy too", () => {
    const { game } = table();
    spawn(game, "Holo-Engineer");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1 }, [ref(bears)]);
    settle(game);
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(0);
    expect(tokensNamed(game, "Illusion Token 3/3 artifact", A)).toBe(1);
  });
});

describe("Hologram Stalker", () => {
  it("makes an Illusion when a card leaves your graveyard, once each turn", () => {
    const { game, a } = table();
    const one = toGraveyard(game, "Grizzly Bears");
    const two = toGraveyard(game, "Hill Giant");
    pickTargets(a, one);
    enter(game, "Hologram Stalker");
    expect(zone(game, one)).toBe("hand");
    expect(tokensNamed(game, "Illusion Token 3/3 artifact", A)).toBe(1);
    game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(two)]);
    settle(game);
    expect(tokensNamed(game, "Illusion Token 3/3 artifact", A)).toBe(1);
  });
});

describe("La'An Noonien-Singh, Security", () => {
  it("triggers only while creatures you control have total power 8 or greater", () => {
    const low = table();
    const laan = spawn(low.game, "La'An Noonien-Singh, Security");
    spawn(low.game, "Hill Giant");
    spawn(low.game, "Grizzly Bears", B);
    const lowSeen = watchTargets(low.a);
    attack(low.game, low.a, [laan]);
    expect(lowSeen.asked).toBe(0);

    const high = table();
    const laan2 = spawn(high.game, "La'An Noonien-Singh, Security");
    spawn(high.game, "Hill Giant");
    spawn(high.game, "Llanowar Elves");
    const theirs = spawn(high.game, "Grizzly Bears", B);
    const seen = watchTargets(high.a, () => [theirs]);
    attack(high.game, high.a, [laan2]);
    expect(seen.asked).toBe(1);
  });
});

describe("The Destruction of Praxis", () => {
  function board(names: readonly string[]): { game: Game; theirs: ObjectId } {
    const { game } = table();
    for (const name of names) spawn(game, name);
    const theirs = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "The Destruction of Praxis"));
    return { game, theirs };
  }

  it("gives -X/-X and makes two hasty Klingon Warriors at 6 or more", () => {
    const { game, theirs } = board(["Plains", "Island", "Swamp", "Swamp", "Mountain", "Forest", "Wastes"]);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(tokensNamed(game, "Klingon Warrior Token", A)).toBe(2);
    const token = named(game, "Klingon Warrior Token", A)[0];
    expect(pt(game, token)).toEqual({ power: 2, toughness: 1 });
  });

  it("makes no tokens below 6", () => {
    // Four names: the Hill Giant gets -4/-4 and dies, and no Klingons come.
    const { game, theirs } = board(["Plains", "Island", "Swamp", "Swamp", "Mountain"]);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(tokensNamed(game, "Klingon Warrior Token", A)).toBe(0);
  });
});

describe("The Traveler", () => {
  it("has power equal to the differently named lands you control", () => {
    const { game } = table();
    const traveler = spawn(game, "The Traveler");
    lands(game, "Island", 2);
    spawn(game, "Forest");
    expect(pt(game, traveler)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Strange new worlds cost reductions", () => {
  it("Suus Mahna Practitioner costs {X} less, generic only", () => {
    const { game } = table();
    const suus = spawn(game, "Suus Mahna Practitioner");
    const theirs = spawn(game, "Grizzly Bears", B);
    spawn(game, "Island");
    spawn(game, "Plains");
    spawn(game, "Swamp");
    // {4}{U} less 3: {1}{U}.
    activate(game, suus, 0, { targets: [ref(theirs)] });
    expect(game.state.objects[theirs].tapped).toBe(true);
  });

  it("Astute Terraformer activates for free at six names, once each turn", () => {
    const { game } = table();
    const terra = spawn(game, "Astute Terraformer");
    for (const name of ["Plains", "Island", "Swamp", "Mountain", "Forest", "Wastes"]) spawn(game, name, A, { tapped: true });
    activate(game, terra, 0);
    expect(pt(game, terra)).toEqual({ power: 4, toughness: 4 });
    expect(() => activate(game, terra, 0)).toThrow();
  });
});

describe("Vengeance Mission", () => {
  it("drains 1, or 2 once it has seven quest counters", () => {
    const { game, a } = table();
    const mission = spawn(game, "Vengeance Mission");
    pickTargets(a, B);
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(life(game, B)).toBe(19);
    game.state.objects[mission].counters.quest = 6;
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(counters(game, mission, "quest")).toBe(7);
    expect(life(game, B)).toBe(17);
  });
});

describe("Planetary Bombardment", () => {
  it("deals 4 instead once a creature died this turn", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Planetary Bombardment"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    destroy(game, spawn(game, "Grizzly Bears"));
    const giant2 = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Planetary Bombardment"), { targets: [ref(giant2)] });
    expect(zone(game, giant2)).toBe("graveyard");
  });
});

describe("Starfleet Security", () => {
  it("investigates only when it dies during your turn", () => {
    const { game } = table();
    destroy(game, spawn(game, "Starfleet Security"));
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    const second = spawn(game, "Starfleet Security");
    nextTurn(game);
    destroy(game, second);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });
});

describe("Subcommander T'Pol", () => {
  it("taps and stuns an artifact or creature", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    // With no ability on the stack the counter mode can't be chosen (rule
    // 700.2a), so the tap mode is the only one offered.
    pickModes(a, 0);
    pickTargets(a, theirs);
    enter(game, "Subcommander T'Pol");
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(counters(game, theirs, "stun")).toBe(1);
  });
});

describe("Commander Raffi Musiker", () => {
  it("investigates and loses 2 life in its second mode", () => {
    const { game, a } = table();
    pickModes(a, 1);
    enter(game, "Commander Raffi Musiker");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(life(game, A)).toBe(18);
  });

  it("exiles a graveyard card and gains 2 in its first mode", () => {
    const { game, a } = table();
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, card);
    enter(game, "Commander Raffi Musiker");
    expect(zone(game, card)).toBe("exile");
    expect(graveyard(game, B)).toHaveLength(0);
    expect(life(game, A)).toBe(22);
  });
});

describe("Species 8472", () => {
  it("gains life equal to the differently named lands you control", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    spawn(game, "Island");
    enter(game, "Species 8472");
    expect(life(game, A)).toBe(22);
  });
});

describe("Ravenous Cosmozoan", () => {
  it("costs {1} less for each noncreature, nonland card in your graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Shock");
    toGraveyard(game, "Opt");
    toGraveyard(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    const cosmo = toHand(game, "Ravenous Cosmozoan");
    cast(game, cosmo);
    expect(zone(game, cosmo)).toBe("battlefield");
  });
});
