/**
 * Batch 264, group A: cards freed by the 2026-11-02/03 need-key families —
 * random permanents, reflexive abilities about what they made, the
 * different-names and linked searches, mass type and colour setting, the
 * "for the rest of the game" hand size and the other freed shapes. One test
 * for each card's condition, choice, replacement or random pick.
 */
import { describe, expect, it } from "vitest";

import { activePlayerOf } from "../state.js";

import {
  A,
  B,
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
  loyalty,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
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
  watchTargets,
  zone,
} from "./harness.js";

const onField = (game: ReturnType<typeof table>["game"], id: string): boolean => zone(game, id as never) === "battlefield";

describe("Finale of Revelation", () => {
  it("with X of 10 shuffles the graveyard in, draws X and untaps five lands", () => {
    const { game } = table();
    const dead = toGraveyard(game, "Grizzly Bears");
    const islands = lands(game, "Island", 12);
    const before = hand(game).length;
    cast(game, toHand(game, "Finale of Revelation"), { x: 10 });
    expect(zone(game, dead)).toBe("library");
    expect(hand(game).length).toBe(before + 10);
    expect(islands.filter((id) => !game.state.objects[id].tapped).length).toBe(5);
  });

  it("with X under 10 only draws", () => {
    const { game } = table();
    const dead = toGraveyard(game, "Grizzly Bears");
    lands(game, "Island", 4);
    const before = hand(game).length;
    cast(game, toHand(game, "Finale of Revelation"), { x: 2 });
    expect(zone(game, dead)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Sea Gate Restoration", () => {
  it("draws one more than the cards in hand as it resolves", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const spell = toHand(game, "Sea Gate Restoration");
    const held = hand(game).length - 1;
    cast(game, spell);
    expect(hand(game).length).toBe(held + held + 1);
  });
});

describe("Last One Standing", () => {
  it("leaves exactly one creature, picked by nobody", () => {
    const { game, a } = table();
    const all = [spawn(game, "Grizzly Bears"), spawn(game, "Serra Angel", B), spawn(game, "Raging Goblin", B)];
    a.choosePermanentsFn = () => {
      throw new Error("nobody chooses");
    };
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Last One Standing"));
    expect(all.filter((id) => onField(game, id)).length).toBe(1);
  });
});

describe("The Nipton Lottery", () => {
  it("steals one creature at random and destroys the rest", () => {
    const { game } = table();
    const all = [spawn(game, "Serra Angel", B), spawn(game, "Grizzly Bears", B), spawn(game, "Raging Goblin")];
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "The Nipton Lottery"));
    const left = all.filter((id) => onField(game, id));
    expect(left.length).toBe(1);
    expect(controller(game, left[0])).toBe(A);
  });
});

describe("Path of Mettle", () => {
  it("deals 1 damage only to creatures without the four keywords", () => {
    const { game } = table();
    const plain = spawn(game, "Llanowar Elves", B);
    const quick = spawn(game, "Raging Goblin", B);
    enter(game, "Path of Mettle");
    expect(zone(game, plain)).toBe("graveyard");
    expect(zone(game, quick)).toBe("battlefield");
  });
});

describe("Haphazard Bombardment", () => {
  it("aims at four permanents and destroys one at random at your end step", () => {
    const { game } = table();
    const theirs = [1, 2, 3, 4].map(() => spawn(game, "Grizzly Bears", B));
    const mine = spawn(game, "Grizzly Bears");
    enter(game, "Haphazard Bombardment");
    expect(theirs.map((id) => counters(game, id, "aim"))).toEqual([1, 1, 1, 1]);
    expect(counters(game, mine, "aim")).toBe(0);
    toStep(game, "end");
    settle(game);
    expect(theirs.filter((id) => zone(game, id) === "graveyard").length).toBe(1);
  });
});

describe("Tyrant of Discord", () => {
  it("has the opponent sacrifice at random until a land goes", () => {
    const { game } = table();
    const land = spawn(game, "Forest", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Serra Angel", B);
    enter(game, "Tyrant of Discord");
    expect(zone(game, land)).toBe("graveyard");
  });
});

describe("Kill Switch", () => {
  it("holds the other artifacts tapped while it stays tapped", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring", B);
    const killSwitch = spawn(game, "Kill Switch");
    lands(game, "Wastes", 2);
    activate(game, killSwitch, 0);
    expect(game.state.objects[ring].tapped).toBe(true);
    expect(game.state.objects[killSwitch].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[ring].tapped).toBe(true);
  });
});

describe("Jailbreak", () => {
  it("offers only your cards with mana value at most the returned one's", () => {
    const { game, a } = table();
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const cheap = toGraveyard(game, "Llanowar Elves");
    const dear = toGraveyard(game, "Serra Angel");
    lands(game, "Plains", 2);
    const seen = watchTargets(a, (offered) => offered.map((slot) => slot[0] ?? null));
    cast(game, toHand(game, "Jailbreak"), { targets: [ref(theirs)] });
    expect(controller(game, theirs)).toBe(B);
    expect(seen.offered[0]).toContain(cheap);
    expect(seen.offered[0]).not.toContain(dear);
    expect(zone(game, cheap)).toBe("battlefield");
  });
});

describe("Ratonhnhaké꞉ton", () => {
  it("returns an Equipment onto the token it made", () => {
    const { game, a } = table();
    const rat = spawn(game, "Ratonhnhaké꞉ton");
    const blade = toGraveyard(game, "Bonesplitter");
    attack(game, a, [rat]);
    settle(game);
    const token = named(game, "Assassin Token (Aya of Alexandria)", A)[0];
    expect(token).toBeDefined();
    expect(zone(game, blade)).toBe("battlefield");
    expect(game.state.objects[blade].attachedTo).toBe(token);
  });
});

describe("Feast of Worms", () => {
  it("makes a legendary land's controller sacrifice another land", () => {
    const { game } = table();
    const cradle = spawn(game, "Gaea's Cradle", B);
    const forest = spawn(game, "Forest", B);
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Feast of Worms"), { targets: [ref(cradle)] });
    expect(zone(game, cradle)).toBe("graveyard");
    expect(zone(game, forest)).toBe("graveyard");
  });
});

describe("Graveyard Shovel", () => {
  it("gains 2 life when the player exiles a creature card", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const shovel = spawn(game, "Graveyard Shovel");
    lands(game, "Wastes", 2);
    activate(game, shovel, 0, { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("exile");
    expect(life(game)).toBe(22);
  });
});

describe("Giant Shark", () => {
  it("gets +2/+0 and trample blocked by a creature dealt damage this turn", () => {
    const { game, a, b } = table();
    spawn(game, "Island", B);
    const shark = spawn(game, "Giant Shark");
    spawn(game, "Island");
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(angel)] });
    b.declareBlockersFn = () => [{ blocker: angel, attacker: shark }];
    attack(game, a, [shark]);
    // 6 power, trample: 2 more is lethal to the Angel, 4 tramples over.
    expect(life(game, B)).toBe(16);
  });

  it("and not by an undamaged one", () => {
    const { game, a, b } = table();
    spawn(game, "Island", B);
    const shark = spawn(game, "Giant Shark");
    spawn(game, "Island");
    const angel = spawn(game, "Serra Angel", B);
    b.declareBlockersFn = () => [{ blocker: angel, attacker: shark }];
    attack(game, a, [shark]);
    expect(life(game, B)).toBe(20);
  });
});

describe("Dread Cacodemon", () => {
  it("cast from hand wipes their creatures and taps your others", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 10);
    const demon = toHand(game, "Dread Cacodemon");
    cast(game, demon);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(game.state.objects[mine].tapped).toBe(true);
    expect(game.state.objects[demon].tapped).toBe(false);
  });

  it("put onto the battlefield, does nothing", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    enter(game, "Dread Cacodemon");
    expect(zone(game, theirs)).toBe("battlefield");
  });
});

describe("Trench Gorger", () => {
  it("becomes as big as the lands it exiles", () => {
    const { game, a } = table();
    const found = [toLibrary(game, "Forest"), toLibrary(game, "Island"), toLibrary(game, "Plains")];
    pickModes(a, 0);
    pickFromZone(a, ...found);
    const gorger = enter(game, "Trench Gorger");
    expect(found.every((id) => zone(game, id) === "exile")).toBe(true);
    expect(pt(game, gorger)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Endless Horizons", () => {
  it("exiles Plains and hands one back each upkeep", () => {
    const { game, a } = table();
    const plains = [toLibrary(game, "Plains"), toLibrary(game, "Plains")];
    pickFromZone(a, ...plains);
    enter(game, "Endless Horizons");
    expect(plains.every((id) => zone(game, id) === "exile")).toBe(true);
    pickFromZone(a, plains[0]);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, plains[0])).toBe("hand");
    expect(zone(game, plains[1])).toBe("exile");
  });
});

describe("Shade's Breath", () => {
  it("makes each creature you control a black Shade with a pump", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Shade's Breath"));
    expect(subtypes(game, bears)).toEqual(["Shade"]);
    expect(subtypes(game, theirs)).toEqual(["Bear"]);
    activate(game, bears, 0);
    expect(pt(game, bears).power).toBe(3);
  });
});

describe("Face Yourself", () => {
  it("copies each creature the target player controls, with haste", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Serra Angel", B);
    lands(game, "Mountain", 7);
    cast(game, toHand(game, "Face Yourself"), { targets: [ref(B)] });
    const mine = game.battlefield.filter((id) => controller(game, id) === A && game.state.objects[id].isToken === true);
    expect(mine.length).toBe(2);
  });
});

describe("Kozilek's Command", () => {
  it("has the target player scry and draw, and exiles a cheap creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 4);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Kozilek's Command"), { x: 2, modes: [1, 2], targets: [ref(B), ref(bears)] });
    expect(hand(game, B).length).toBe(before + 1);
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Evil's Thrall", () => {
  it("keeps the creature through your next turn with a bigger Villain", () => {
    const { game } = table();
    spawn(game, "A.I.M. Scientists");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Evil's Thrall"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    nextTurn(game);
    expect(controller(game, bears)).toBe(A);
  });

  it("only this turn without one", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Evil's Thrall"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    nextTurn(game);
    expect(controller(game, bears)).toBe(B);
  });
});

describe("Teferi, Temporal Pilgrim", () => {
  it("−12: they return one permanent, then shuffle their other nonland permanents away", () => {
    const { game, b } = table();
    const teferi = spawn(game, "Teferi, Temporal Pilgrim");
    const kept = spawn(game, "Serra Angel", B);
    const shuffled = spawn(game, "Grizzly Bears", B);
    const land = spawn(game, "Forest", B);
    pickPermanents(b, kept);
    loyalty(game, teferi, -12, { atLeast: 12, targets: [ref(B)] });
    expect(zone(game, kept)).toBe("hand");
    expect(zone(game, shuffled)).toBe("library");
    expect(zone(game, land)).toBe("battlefield");
  });
});

describe("Kogla and Yidaro", () => {
  it("from hand: destroys an artifact, shuffles itself in and draws", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring", B);
    const kogla = toHand(game, "Kogla and Yidaro");
    lands(game, "Mountain", 3);
    lands(game, "Forest", 1);
    const before = hand(game).length;
    activate(game, kogla, 0, { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, kogla)).toBe("library");
    expect(hand(game).length).toBe(before);
  });
});

describe("Beseech the Mirror", () => {
  it("unbargained, puts the found card into your hand", () => {
    const { game, a } = table();
    const found = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, found);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Beseech the Mirror"));
    expect(zone(game, found)).toBe("hand");
  });
});

describe("Fblthp, Knows the Way", () => {
  it("finds up to X basic lands with different names", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    const forest2 = toLibrary(game, "Forest");
    const island = toLibrary(game, "Island");
    pickFromZone(a, forest, island);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Fblthp, Knows the Way"), { x: 2 });
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, island)).toBe("hand");
    expect(zone(game, forest2)).toBe("library");
  });
});

describe("Bill Ferny, Bree Swindler", () => {
  it("gives a Horse away, leaves combat and makes three Treasures", () => {
    const { game, a, b } = table();
    const bill = spawn(game, "Bill Ferny, Bree Swindler");
    const horse = spawn(game, "Armored Warhorse");
    const blocker = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker, attacker: bill }];
    pickModes(a, 1);
    a.chooseTargetsFn = () => [ref(B), ref(horse)];
    attack(game, a, [bill]);
    expect(controller(game, horse)).toBe(B);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(3);
    expect(zone(game, bill)).toBe("battlefield");
  });
});

describe("The Rollercrusher Ride", () => {
  it("doubles noncombat damage with delirium", () => {
    const { game } = table();
    spawn(game, "The Rollercrusher Ride");
    for (const card of ["Grizzly Bears", "Forest", "Shock", "Sol Ring"]) toGraveyard(game, card);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
  });

  it("and not without it", () => {
    const { game } = table();
    spawn(game, "The Rollercrusher Ride");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });
});

describe("Tor Wauki the Younger", () => {
  it("adds 1 to another source's noncombat damage, not to its own", () => {
    const { game, a } = table();
    spawn(game, "Tor Wauki the Younger");
    a.chooseTargetsFn = () => [ref(B)];
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(20 - 2 - 3);
  });
});

describe("Kitsune Mystic", () => {
  it("flips at the end step enchanted by two Auras", () => {
    const { game, a } = table();
    const mystic = spawn(game, "Kitsune Mystic");
    lands(game, "Plains", 2);
    a.chooseTargetsFn = () => [ref(mystic)];
    cast(game, toHand(game, "Holy Strength"), { targets: [ref(mystic)] });
    cast(game, toHand(game, "Holy Strength"), { targets: [ref(mystic)] });
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[mystic].flipped).toBe(true);
  });
});

describe("Hans Eriksson", () => {
  it("puts a creature card in attacking, then they fight", () => {
    const { game, a } = table();
    const hans = spawn(game, "Hans Eriksson");
    const bears = toLibrary(game, "Grizzly Bears");
    attack(game, a, [hans]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[hans].damageMarked).toBe(2);
    expect(life(game, B)).toBe(20 - 1 - 2);
  });

  it("puts anything else into your hand", () => {
    const { game, a } = table();
    const hans = spawn(game, "Hans Eriksson");
    const bolt = toLibrary(game, "Lightning Bolt");
    attack(game, a, [hans]);
    expect(zone(game, bolt)).toBe("hand");
  });
});

describe("Northampton Farm", () => {
  it("returns one creature card to the battlefield and the rest to hand", () => {
    const { game, a } = table();
    const farm = spawn(game, "Northampton Farm");
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel");
    lands(game, "Wastes", 4);
    activate(game, farm, 1, { targets: [ref(bears)] });
    game.state.objects[farm].tapped = false;
    activate(game, farm, 1, { targets: [ref(angel)] });
    game.state.objects[farm].tapped = false;
    pickFromZone(a, angel);
    activate(game, farm, 2);
    expect(zone(game, angel)).toBe("battlefield");
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Unexpected Request", () => {
  it("attaches your Equipment to the stolen creature until the next end step", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Serra Angel", B);
    const blade = spawn(game, "Bonesplitter");
    lands(game, "Mountain", 3);
    pickPermanents(a, blade);
    cast(game, toHand(game, "Unexpected Request"), { targets: [ref(theirs)] });
    expect(controller(game, theirs)).toBe(A);
    expect(game.state.objects[blade].attachedTo).toBe(theirs);
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[blade].attachedTo ?? null).toBe(null);
  });
});

describe("Price of Knowledge", () => {
  it("deals each opponent their hand size at their upkeep", () => {
    const { game } = table();
    spawn(game, "Price of Knowledge");
    const held = hand(game, B).length;
    nextTurn(game);
    expect(life(game, B)).toBe(20 - held);
  });
});

describe("Anvil of Bogardan", () => {
  it("draws an extra card, then discards one, in each draw step", () => {
    const { game } = table();
    spawn(game, "Anvil of Bogardan");
    const before = hand(game, B).length;
    nextTurn(game);
    expect(hand(game, B).length).toBe(before + 1);
    expect(graveyard(game, B).length).toBe(1);
  });
});

describe("Balthor the Defiled", () => {
  it("returns each player's black and red creature cards under their own control", () => {
    const { game } = table();
    const balthor = spawn(game, "Balthor the Defiled");
    const theirs = toGraveyard(game, "Raging Goblin", B);
    const green = toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    activate(game, balthor, 0);
    expect(zone(game, balthor)).toBe("exile");
    expect(zone(game, theirs)).toBe("battlefield");
    expect(controller(game, theirs)).toBe(B);
    expect(zone(game, green)).toBe("graveyard");
  });
});

describe("Denizen of the Deep", () => {
  it("returns your other creatures, not itself", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const denizen = enter(game, "Denizen of the Deep");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, theirs)).toBe("battlefield");
    expect(zone(game, denizen)).toBe("battlefield");
  });
});

describe("Kassandra, Eagle Bearer", () => {
  it("finds The Spear of Leonidas in your hand", () => {
    const { game, a } = table();
    const spear = toHand(game, "The Spear of Leonidas");
    pickFromZone(a, spear);
    enter(game, "Kassandra, Eagle Bearer");
    expect(zone(game, spear)).toBe("battlefield");
  });
});

describe("Juntu Stakes", () => {
  it("keeps power-1 creatures tapped", () => {
    const { game } = table();
    spawn(game, "Juntu Stakes");
    const elves = spawn(game, "Llanowar Elves", B, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    nextTurn(game);
    expect(game.state.objects[elves].tapped).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Heroism", () => {
  it("stops an attacking red creature's combat damage when its controller can't pay", () => {
    const { game, b } = table();
    const heroism = spawn(game, "Heroism");
    const fodder = spawn(game, "Savannah Lions");
    const goblin = spawn(game, "Raging Goblin", B);
    b.declareAttackersFn = () => [{ attacker: goblin, defender: A }];
    game.advanceUntil(
      (s) => activePlayerOf(s) === B && s.turn.step === "declare-attackers" && s.priority.holder === A && s.zones.shared.stack.length === 0,
    );
    activate(game, heroism, 0, { sacrifice: fodder });
    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "postcombat-main");
    expect(life(game)).toBe(20);
  });
});

describe("Thousand Winds", () => {
  it("turned face up, returns the other tapped creatures only", () => {
    const { game } = table();
    const tapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    const untapped = spawn(game, "Grizzly Bears", B);
    const winds = spawn(game, "Thousand Winds", A, { tapped: true });
    game.state.objects[winds].faceDown = { kind: "morph" };
    lands(game, "Island", 7);
    game.dispatch({ type: "turn-face-up", player: A, permanent: winds, morph: true });
    settle(game);
    expect(zone(game, tapped)).toBe("hand");
    expect(zone(game, untapped)).toBe("battlefield");
    expect(zone(game, winds)).toBe("battlefield");
  });
});

describe("Bumi, King of Three Trials", () => {
  it("chooses no more modes than Lessons in your graveyard", () => {
    const { game, a } = table();
    toGraveyard(game, "Earthbending Lesson");
    let offered = -1;
    a.chooseModesFn = (_view, _min, max) => {
      offered = max;
      return [0];
    };
    const bumi = enter(game, "Bumi, King of Three Trials");
    expect(offered).toBe(1);
    expect(counters(game, bumi)).toBe(3);
  });
});

describe("Glissa, Herald of Predation", () => {
  it("incubates 2 twice", () => {
    const { game, a } = table();
    spawn(game, "Glissa, Herald of Predation");
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    const incubators = game.battlefield.filter((id) => game.state.objects[id].cardName.startsWith("Incubator"));
    expect(incubators.length).toBe(2);
    expect(incubators.map((id) => counters(game, id))).toEqual([2, 2]);
  });
});

describe("Metzali, Tower of Triumph", () => {
  it("destroys a creature that attacked this turn, at random", () => {
    const { game, a } = table();
    const attacker = spawn(game, "Grizzly Bears");
    const idle = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const metzali = spawn(game, "Path of Mettle");
    game.state.objects[metzali].face = 1;
    lands(game, "Plains", 3);
    attack(game, a, [attacker]);
    activate(game, metzali, 2);
    expect(zone(game, attacker)).toBe("graveyard");
    expect(zone(game, idle)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("battlefield");
  });
});

describe("Grave Birthing", () => {
  it("has the target opponent choose the card to exile", () => {
    const { game, b } = table();
    const kept = toGraveyard(game, "Grizzly Bears", B);
    const gone = toGraveyard(game, "Forest", B);
    pickFromZone(b, gone);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Grave Birthing"), { targets: [ref(B)] });
    expect(zone(game, gone)).toBe("exile");
    expect(zone(game, kept)).toBe("graveyard");
    expect(tokensNamed(game, "Eldrazi Scion Token", A)).toBe(1);
  });
});

describe("Visions", () => {
  it("leaves the library's order alone unless you have it shuffled", () => {
    const { game, a } = table();
    const top = toLibrary(game, "Grizzly Bears", B);
    pickModes(a);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Visions"), { targets: [ref(B)] });
    const library = game.state.zones.perPlayer[B].library;
    expect(library[library.length - 1] === top || library[0] === top).toBe(true);
  });
});

describe("Ancient Silver Dragon", () => {
  it("draws the d20's result on combat damage", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Ancient Silver Dragon");
    const before = hand(game).length;
    attack(game, a, [dragon]);
    const drawn = hand(game).length - before;
    expect(drawn).toBeGreaterThanOrEqual(1);
    expect(drawn).toBeLessThanOrEqual(20);
  });
});

describe("Reach the Horizon", () => {
  it("finds lands only with different names", () => {
    const { game, a } = table();
    const one = toLibrary(game, "Forest");
    const two = toLibrary(game, "Forest");
    let refused = false;
    a.chooseFromZoneFn = (_view, eligible) => {
      if (!refused) {
        refused = true;
        return [one, two];
      }
      return eligible.slice(0, 1);
    };
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Reach the Horizon"));
    expect([one, two].filter((id) => zone(game, id) === "battlefield").length).toBe(1);
  });
});

describe("Standardize", () => {
  it("makes every creature the chosen type", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Serra Angel", B);
    a.chooseCreatureTypeFn = () => "Goblin";
    lands(game, "Island", 2);
    cast(game, toHand(game, "Standardize"));
    expect(subtypes(game, mine)).toEqual(["Goblin"]);
    expect(subtypes(game, theirs)).toEqual(["Goblin"]);
  });
});

describe("Autumn-Tail, Kitsune Sage", () => {
  it("moves an Aura onto another creature, chosen as it resolves", () => {
    const { game, a } = table();
    const sage = spawn(game, "Kitsune Mystic");
    game.state.objects[sage].flipped = true;
    game.state.objects[sage].flippedName = "Autumn-Tail, Kitsune Sage";
    const bears = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Serra Angel", B);
    lands(game, "Plains", 3);
    a.chooseTargetsFn = () => [ref(bears)];
    cast(game, toHand(game, "Pacifism"), { targets: [ref(bears)] });
    const pacifism = named(game, "Pacifism")[0];
    pickPermanents(a, other);
    activate(game, sage, 0, { targets: [ref(pacifism)] });
    expect(game.state.objects[pacifism].attachedTo).toBe(other);
  });
});

describe("Urza, Lord High Artificer", () => {
  it("{5}: exiles the top card after shuffling, free to play this turn", () => {
    const { game } = table();
    const urza = spawn(game, "Urza, Lord High Artificer");
    lands(game, "Island", 5);
    const exiledBefore = game.state.zones.shared.exile.length;
    activate(game, urza, 1);
    expect(game.state.zones.shared.exile.length).toBe(exiledBefore + 1);
  });
});
