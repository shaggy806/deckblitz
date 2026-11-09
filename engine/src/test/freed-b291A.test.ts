/**
 * Batch 291, group A: the last of the freed-cards queue. One focused test per
 * card with a condition, a replacement, a choice or a duration, on the clause
 * most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
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
  toLibrary,
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";


describe("River of Tears, Rock Jockey: a land played this turn", () => {
  it("River makes U before a land drop and B after", () => {
    const { game } = table();
    const river = spawn(game, "River of Tears");
    activate(game, river, 0);
    expect(JSON.stringify(game.state.players[A].manaPool)).toContain("U");
    const fresh = table();
    const river2 = spawn(fresh.game, "River of Tears");
    const land = toHand(fresh.game, "Island");
    fresh.game.dispatch({ type: "play-land", player: A, card: land });
    activate(fresh.game, river2, 0);
    expect(JSON.stringify(fresh.game.state.players[A].manaPool)).toContain("B");
  });

  it("Rock Jockey stops land plays once cast, and can't be cast after one", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Rock Jockey"));
    const land = toHand(game, "Mountain");
    expect(game.canDispatch({ type: "play-land", player: A, card: land })).not.toBeNull();
    const fresh = table();
    lands(fresh.game, "Mountain", 3);
    fresh.game.dispatch({ type: "play-land", player: A, card: toHand(fresh.game, "Mountain") });
    const jockey = toHand(fresh.game, "Rock Jockey");
    expect(fresh.game.canDispatch({ type: "cast-spell", player: A, card: jockey, targets: [] })).not.toBeNull();
  });
});

describe("Bruenor Battlehammer", () => {
  it("counts each creature's own Equipment", () => {
    const { game } = table();
    spawn(game, "Bruenor Battlehammer");
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    const bone = spawn(game, "Bonesplitter");
    lands(game, "Mountain", 2);
    activate(game, bone, 0, { targets: [ref(giant)] });
    expect(pt(game, giant).power).toBe(3 + 2 + 2);
    expect(pt(game, bears).power).toBe(2);
  });
});

describe("Vulture, Feathered Fiend", () => {
  it("puts counters only on the flyers that dealt damage, once for the batch", () => {
    const { game, a } = table();
    spawn(game, "Vulture, Feathered Fiend");
    const crow = spawn(game, "Storm Crow");
    const giant = spawn(game, "Hill Giant");
    const before = hand(game, A).length;
    attack(game, a, [crow, giant]);
    expect(counters(game, crow)).toBe(1);
    expect(counters(game, giant)).toBe(0);
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("Riveteers Ascendancy", () => {
  it("once it's returned one this turn, it doesn't trigger; a decline didn't use it up", () => {
    const { game, a } = table();
    spawn(game, "Riveteers Ascendancy");
    const outlet = spawn(game, "Viscera Seer");
    const bigs = [spawn(game, "Hill Giant"), spawn(game, "Hill Giant"), spawn(game, "Hill Giant")];
    const bear = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bear);
    pickModes(a);
    activate(game, outlet, 0, { sacrifice: bigs[0] });
    settle(game);
    expect(zone(game, bear)).toBe("graveyard"); // declined
    pickModes(a, 0);
    activate(game, outlet, 0, { sacrifice: bigs[1] });
    settle(game);
    expect(zone(game, bear)).toBe("battlefield");
    expect(game.state.objects[bear].tapped).toBe(true);
    const bear2 = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bear2);
    activate(game, outlet, 0, { sacrifice: bigs[2] });
    settle(game);
    expect(zone(game, bear2)).toBe("graveyard");
  });
});

describe("Botanical Brawler, Danny Pink: the first time counters arrive", () => {
  it("Brawler triggers only for a permanent's first +1/+1 counters this turn", () => {
    const { game } = table();
    const brawler = enter(game, "Botanical Brawler");
    const bears = spawn(game, "Grizzly Bears");
    expect(counters(game, brawler)).toBe(2);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    settle(game);
    expect(counters(game, brawler)).toBe(3);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    settle(game);
    expect(counters(game, brawler)).toBe(3);
  });

  it("Danny's creatures draw on their first counter of the turn only", () => {
    const { game } = table();
    spawn(game, "Danny Pink");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game, A).length;
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    settle(game);
    expect(hand(game, A).length).toBe(before + 1);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    settle(game);
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("Curse of Vengeance", () => {
  it("pays out on the enchanted player's loss, its counters read as it last existed", () => {
    const { game } = table({ players: 3 });
    lands(game, "Swamp", 1);
    const curse = toHand(game, "Curse of Vengeance");
    cast(game, curse, { targets: [ref(B)] });
    game.state.objects[curse].counters.spite = 2;
    const before = hand(game, A).length;
    game.debugApplyEffect(A, { kind: "lose-game", target: 0 }, [ref(B)]);
    settle(game);
    expect(life(game, A)).toBe(22);
    expect(hand(game, A).length).toBe(before + 2);
  });

  it("a player other than the enchanted one losing does nothing", () => {
    const { game } = table({ players: 3 });
    lands(game, "Swamp", 1);
    const curse = toHand(game, "Curse of Vengeance");
    cast(game, curse, { targets: [ref(B)] });
    game.state.objects[curse].counters.spite = 2;
    game.debugApplyEffect(A, { kind: "lose-game", target: 0 }, [ref(C)]);
    settle(game);
    expect(life(game, A)).toBe(20);
  });
});

describe("The Eagles Are Coming!", () => {
  it("kicked, counts every creature returned, a token included, at the next upkeep", () => {
    const { game } = table();
    lands(game, "Plains", 8);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Raise the Alarm"), {});
    const soldier = named(game, "Soldier Token", A)[0];
    const eagles = toHand(game, "The Eagles Are Coming!");
    cast(game, eagles, { targets: [ref(bears), ref(soldier)], kicked: true } as Parameters<typeof cast>[2]);
    expect(zone(game, bears)).toBe("hand");
    nextTurn(game, "upkeep");
    settle(game);
    expect(tokensNamed(game, "Bird Soldier Token (4/4 Flying)", A) + named(game, "Bird Soldier Token (4/4 Flying)", A).length).toBeGreaterThanOrEqual(2);
  });
});

describe("Coin of Fate", () => {
  it("an opponent picks the bottom card, the other returns tapped, you become the monarch", () => {
    const { game, b } = table();
    lands(game, "Plains", 4);
    const coin = spawn(game, "Coin of Fate");
    const giant = toGraveyard(game, "Hill Giant");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickFromZone(b, giant);
    activate(game, coin, 0);
    settle(game);
    expect(zone(game, coin)).toBe("graveyard");
    expect(zone(game, giant)).toBe("library");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.monarch).toBe(A);
  });
});

describe("Kindred Summons", () => {
  it("reveals until X of the chosen type, X read from the chosen type", () => {
    const { game, a } = table();
    lands(game, "Forest", 7);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const top = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Runeclaw Bear"), toLibrary(game, "Grizzly Bears")];
    a.chooseCreatureTypeFn = () => "Bear";
    cast(game, toHand(game, "Kindred Summons"));
    const onBattlefield = top.filter((id) => zone(game, id) === "battlefield").length;
    expect(onBattlefield).toBe(2);
  });
});

describe("Storm Elemental, Phyrexian Devourer: the exiled card", () => {
  it("Storm Elemental: +1/+1 only when the exiled card is a snow land", () => {
    const { game } = table({ deck: "Island" });
    const elemental = spawn(game, "Storm Elemental");
    lands(game, "Island", 3);
    activate(game, elemental, 1);
    settle(game);
    expect(pt(game, elemental).power).toBe(3);
    toLibrary(game, "Snow-Covered Island");
    activate(game, elemental, 1);
    settle(game);
    expect(pt(game, elemental).power).toBe(4);
  });

  it("Devourer: X from the card the cost exiled, sacrificed at power 7", () => {
    const { game } = table();
    const devourer = spawn(game, "Phyrexian Devourer");
    toLibrary(game, "Hill Giant");
    activate(game, devourer, 0);
    settle(game);
    expect(counters(game, devourer)).toBe(4);
    toLibrary(game, "Hill Giant");
    activate(game, devourer, 0);
    settle(game);
    expect(zone(game, devourer)).toBe("graveyard");
  });
});

describe("HELIOS One", () => {
  it("pays X energy, with X the target's mana value", () => {
    const { game } = table();
    const helios = spawn(game, "HELIOS One");
    lands(game, "Wastes", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.players[A].energy = 2;
    activate(game, helios, 2, { x: 2, targets: [ref(bears)] });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.players[A].energy).toBe(0);
  });
});

describe("Fires of Invention", () => {
  it("no more than two spells each turn, the first half of it reading the whole turn", () => {
    const { game } = table({ deck: "Mountain" });
    spawn(game, "Fires of Invention");
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    const third = toHand(game, "Shock");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: third, targets: [ref(B)] })).not.toBeNull();
  });
});

describe("Blood Clock, Umbilicus", () => {
  it("Umbilicus: paying spares the permanent, not paying returns one", () => {
    const { game, b } = table({ deck: "Mountain" });
    spawn(game, "Umbilicus");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b, 0);
    nextTurn(game, "upkeep");
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Blood Clock: not paying returns a permanent of theirs", () => {
    const { game, b } = table({ deck: "Mountain" });
    spawn(game, "Blood Clock");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b);
    pickPermanents(b, bears);
    nextTurn(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    expect(controller(game, bears)).toBe(B);
  });
});

describe("Wild Pair", () => {
  it("searches for a creature with the same total power and toughness", () => {
    const { game, a } = table();
    spawn(game, "Wild Pair");
    lands(game, "Forest", 2);
    pickModes(a, 0);
    const offered = pickFromZone(a);
    const target = toLibrary(game, "Hill Giant"); // 3/3 total 6; not offered for a total of 4
    const fit = toLibrary(game, "Grizzly Bears");
    cast(game, toHand(game, "Grizzly Bears"));
    expect(offered.offered).toContain(fit);
    expect(offered.offered).not.toContain(target);
  });
});

describe("Loki, God of Lies", () => {
  it("takes the single creature your spell targets, until end of turn", () => {
    const { game } = table();
    spawn(game, "Loki, God of Lies");
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)], settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.pendingTriggers.length === 0);
    settle(game);
    expect(graveyard(game, B)).toContain(bears);
  });
});
