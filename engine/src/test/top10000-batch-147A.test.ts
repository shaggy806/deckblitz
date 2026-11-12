/**
 * Batch 309, group A — EDHREC ranks 12838–15470. One test per clause most
 * likely to be wrong: the granted block restriction (Tadeas), the per-player
 * counts (Azula, Bosco, Highcliff Felidar, Goblin Goliath), the dice
 * (Mathise, Monoxa, Slight Malfunction), the casts made as something
 * resolves (Storm of Memories, Gandalf, Nathan Drake, Soundwave), the cost
 * reads (Grim Giganotosaurus, Sokka, Ellie and Alan) and the one-play
 * permission over discovery counters (Lara Croft).
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  activate,
  attack,
  blockOffer,
  cast,
  controller,
  counters,
  destroy,
  enter,
  grant,
  graveyard,
  hand,
  keywords,
  lands,
  life,
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
  types,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { TargetRef } from "../target.js";

const addCounters = (game: Game, id: ObjectId, counter: string, amount: number): void => {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter, amount }, [ref(id)]);
};
const makeToken = (game: Game, token: string, player: PlayerId = A): ObjectId => {
  const before = new Set(game.battlefield);
  game.debugApplyEffect(player, { kind: "create-token", token, count: 1 }, []);
  settle(game);
  const made = game.battlefield.find((id) => !before.has(id));
  if (made === undefined) throw new Error(`no ${token} made`);
  return made;
};
const lastRoll = (game: Game): number => {
  const rolls = (game.state.journal?.entries ?? []).filter((e) => e.kind === "rolled");
  const total = rolls.at(-1)?.roll?.total;
  if (total === undefined) throw new Error("nothing rolled");
  return total;
};
/** The seat casts the first card it's offered as something resolves. */
const acceptCastNow = (seat: ScriptedController, targets: readonly TargetRef[], free = true, name?: string): void => {
  seat.chooseCastNowFn = (view, offer) => {
    const card = name === undefined ? offer.cards[0] : offer.cards.find((id) => view.state.objects[id]?.cardName === name);
    if (card === undefined) return null;
    return { type: "cast-spell", player: seat.playerId, card, targets: [...targets], via: "effect", ...(free ? { free: true } : {}) };
  };
};
const handNames = (game: Game, player: PlayerId = A): string[] => hand(game, player).map((id) => game.state.objects[id].cardName);
const inExile = (game: Game, name: string): ObjectId[] =>
  Object.entries(game.state.objects)
    .filter(([, o]) => o.zone === "exile" && o.cardName === name)
    .map(([id]) => id as ObjectId);
const castOffered = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((o) => (o.kind === "cast-spell" || o.kind === "play-land") && o.card === card);

describe("Tadeas, Juniper Ascendant", () => {
  it("has hexproof unless attacking; a reach attacker untaps and can't be blocked by greater power", () => {
    const { game, a } = table();
    const tadeas = spawn(game, "Tadeas, Juniper Ascendant");
    const giant = spawn(game, "Hill Giant", B);
    const elves = spawn(game, "Llanowar Elves", B);
    expect(keywords(game, tadeas).has("hexproof")).toBe(true);
    const offer = blockOffer(game, a, [tadeas]);
    expect(game.state.objects[tadeas].tapped).toBe(false);
    expect(keywords(game, tadeas).has("hexproof")).toBe(false);
    const canBlock = (id: ObjectId) => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(canBlock(giant)).toEqual([]);
    expect(canBlock(elves)).toEqual([tadeas]);
  });
});

describe("Gregor, Shrewd Magistrate", () => {
  it("draws cards equal to its power", () => {
    const { game, a } = table();
    const gregor = spawn(game, "Gregor, Shrewd Magistrate");
    addCounters(game, gregor, "+1/+1", 2);
    const before = hand(game).length;
    attack(game, a, [gregor]);
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("Thorin, Company's Leader", () => {
  it("a Dwarf dealing combat damage makes two Treasures", () => {
    const { game, a } = table();
    const thorin = spawn(game, "Thorin, Company's Leader");
    attack(game, a, [thorin]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });
});

describe("Lost in Memories", () => {
  it("+1/+1, and its combat damage gives a graveyard instant flashback", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const shock = toGraveyard(game, "Shock");
    cast(game, toHand(game, "Lost in Memories"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(castOffered(game, shock)).toBe(false);
    pickTargets(a, shock);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(17);
    expect(castOffered(game, shock)).toBe(true);
  });
});

describe("Stardew Valley", () => {
  it("draws, then the other player may take the permanent", () => {
    const { game, b } = table();
    const valley = spawn(game, "Stardew Valley");
    lands(game, "Wastes", 3);
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    pickModes(b, 0);
    activate(game, valley, 2, { targets: [ref(bears)] });
    expect(hand(game).length).toBe(before + 1);
    expect(controller(game, bears)).toBe(B);
  });

  it("…or decline it", () => {
    const { game, b } = table();
    const valley = spawn(game, "Stardew Valley");
    lands(game, "Wastes", 3);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(b);
    activate(game, valley, 2, { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
  });
});

describe("Mathise, Surge Channeler", () => {
  it("rolls a d20 for a three-mana sorcery and follows the table", () => {
    for (const seed of [1, 2, 3, 4]) {
      const { game } = table({ seed });
      spawn(game, "Mathise, Surge Channeler");
      lands(game, "Island", 3);
      const divination = toHand(game, "Divination");
      const mine = hand(game).length;
      const bobs = hand(game, B).length;
      cast(game, divination);
      const roll = lastRoll(game);
      // Divination leaves the hand and draws two.
      if (roll <= 9) {
        expect(hand(game).length).toBe(mine + 2);
        expect(hand(game, B).length).toBe(bobs + 1);
      } else if (roll <= 19) {
        expect(hand(game).length).toBe(mine + 2);
        expect(hand(game, B).length).toBe(bobs);
      } else {
        expect(hand(game).length).toBe(mine + 3);
      }
    }
  });

  it("doesn't roll for a cheaper spell", () => {
    const { game } = table();
    spawn(game, "Mathise, Surge Channeler");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect((game.state.journal?.entries ?? []).some((e) => e.kind === "rolled")).toBe(false);
  });
});

describe("Bosco, Just a Bear", () => {
  it("a Food for each legendary creature, himself included; eats one for counters and trample", () => {
    const { game } = table();
    spawn(game, "Isamaru, Hound of Konda");
    spawn(game, "Grizzly Bears");
    const bosco = enter(game, "Bosco, Just a Bear");
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
    lands(game, "Forest", 3);
    const [food] = named(game, "Food Token", A);
    activate(game, bosco, 0, { sacrifice: food });
    expect(counters(game, bosco)).toBe(2);
    expect(keywords(game, bosco).has("trample")).toBe(true);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });
});

describe("Gandalf, Shadow's Foe", () => {
  it("blinks two lands back tapped, and each one's landfall draws and grows him", () => {
    const { game, a } = table();
    const [one, two] = lands(game, "Island", 2);
    const before = hand(game).length;
    pickTargets(a, one, two);
    const gandalf = enter(game, "Gandalf, Shadow's Foe");
    const islands = named(game, "Island", A);
    expect(islands).toHaveLength(2);
    expect(islands.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(hand(game).length).toBe(before + 2);
    expect(counters(game, gandalf)).toBe(2);
  });
});

describe("Elephant-Mandrill", () => {
  it("everyone gets a Food; it grows for each artifact the opponents control", () => {
    const { game } = table();
    spawn(game, "Sol Ring", B);
    const mandrill = enter(game, "Elephant-Mandrill");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    expect(tokensNamed(game, "Food Token", B)).toBe(1);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, mandrill)).toEqual({ power: 5, toughness: 4 });
  });
});

describe("Elmar, Ulvenwald Informant", () => {
  it("the second spell untaps a creature and investigates", () => {
    const { game, a } = table();
    spawn(game, "Elmar, Ulvenwald Informant");
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
    pickTargets(a, bears);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });
});

describe("Zuko, Avatar Hunter", () => {
  it("a red spell makes a 2/2 red Soldier", () => {
    const { game } = table();
    spawn(game, "Zuko, Avatar Hunter");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    const [soldier] = named(game, "Soldier Token (Red 2/2)", A);
    expect(pt(game, soldier)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Azula, Ruthless Firebender", () => {
  it("an experience counter for each player who discarded this turn; the pump reads them", () => {
    const { game, a } = table();
    const azula = spawn(game, "Azula, Ruthless Firebender");
    game.debugApplyEffect(B, { kind: "discard", target: "you", amount: 1 }, []);
    settle(game);
    pickModes(a, 0);
    attack(game, a, [azula]);
    expect(game.state.players[A].counters.experience).toBe(2);
    lands(game, "Swamp", 3);
    activate(game, azula, 0);
    expect(pt(game, azula)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, azula).has("menace")).toBe(true);
  });

  it("declining the discard still counts the others", () => {
    const { game, a } = table();
    const azula = spawn(game, "Azula, Ruthless Firebender");
    game.debugApplyEffect(B, { kind: "discard", target: "you", amount: 1 }, []);
    settle(game);
    pickModes(a);
    attack(game, a, [azula]);
    expect(game.state.players[A].counters.experience).toBe(1);
  });
});

describe("Double Trouble", () => {
  it("doubles power only", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Double Trouble"));
    expect(pt(game, giant)).toEqual({ power: 6, toughness: 3 });
  });
});

describe("Storm of Memories", () => {
  it("exiles a cheap instant from the graveyard and casts it free, exiled after", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    toGraveyard(game, "Shock");
    toGraveyard(game, "Concentrate");
    acceptCastNow(a, [ref(B)]);
    cast(game, toHand(game, "Storm of Memories"));
    expect(life(game, B)).toBe(18);
    expect(inExile(game, "Shock")).toHaveLength(1);
    expect(graveyard(game).map((id) => game.state.objects[id].cardName)).toContain("Concentrate");
  });
});

describe("Grasping Tentacles", () => {
  it("mills eight and takes an artifact from that graveyard", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 1);
    toLibrary(game, "Sol Ring", B);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    cast(game, toHand(game, "Grasping Tentacles"), { targets: [ref(B)] });
    expect(named(game, "Sol Ring", A)).toHaveLength(1);
    expect(graveyard(game, B)).toHaveLength(7);
  });
});

describe("Calculating Lich", () => {
  it("a creature attacking an opponent costs that player 1 life", () => {
    const { game, a } = table();
    spawn(game, "Calculating Lich");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(17);
  });
});

describe("Grim Giganotosaurus", () => {
  it("costs {1} less per big opposing creature; monstrous, it destroys every other artifact and creature", () => {
    const { game } = table();
    const giga = spawn(game, "Grim Giganotosaurus");
    const wurms = [spawn(game, "Craw Wurm", B), spawn(game, "Craw Wurm", B)];
    const ring = spawn(game, "Sol Ring", B);
    const mine = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 8);
    activate(game, giga, 0);
    expect(counters(game, giga)).toBe(10);
    for (const id of [...wurms, ring, mine]) expect(zone(game, id)).toBe("graveyard");
    expect(zone(game, giga)).toBe("battlefield");
  });
});

describe("Vogar, Necropolis Tyrant", () => {
  it("grows only on its controller's turn, and draws for its counters as it dies", () => {
    const { game } = table();
    const vogar = spawn(game, "Vogar, Necropolis Tyrant");
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(counters(game, vogar)).toBe(1);
    nextTurn(game);
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(counters(game, vogar)).toBe(1);
    const before = hand(game).length;
    destroy(game, vogar);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Slight Malfunction", () => {
  it("the roll's reflexive trigger deals 1 to a chosen creature", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const elves = spawn(game, "Llanowar Elves", B);
    pickTargets(a, elves);
    cast(game, toHand(game, "Slight Malfunction"), { modes: [1] });
    expect(lastRoll(game)).toBeGreaterThanOrEqual(1);
    expect(zone(game, elves)).toBe("graveyard");
  });

  it("or destroys an artifact", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Slight Malfunction"), { modes: [0], targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Sokka, Swordmaster", () => {
  it("Equipment costs {1} less per Ally, and he picks one up at combat", () => {
    const { game, a } = table();
    const sokka = spawn(game, "Sokka, Swordmaster");
    spawn(game, "Loyal Fire Sage");
    lands(game, "Plains", 1);
    const hammer = toHand(game, "Loxodon Warhammer");
    cast(game, hammer);
    expect(zone(game, hammer)).toBe("battlefield");
    pickTargets(a, hammer);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, sokka)).toEqual({ power: 6, toughness: 3 });
  });
});

describe("Highcliff Felidar", () => {
  it("destroys each opponent's greatest-power creature", () => {
    const { game } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const wurm = spawn(game, "Craw Wurm", C);
    const mine = spawn(game, "Craw Wurm", A);
    enter(game, "Highcliff Felidar");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Ancestor Dragon", () => {
  it("1 life for each attacking creature", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Ancestor Dragon");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [dragon, bears]);
    expect(life(game, A)).toBe(22);
  });
});

describe("Goblin Goliath", () => {
  it("a Goblin per opponent; then doubles damage your sources deal to opponents", () => {
    const { game } = table({ players: 3 });
    const goliath = enter(game, "Goblin Goliath");
    expect(tokensNamed(game, "Goblin Token", A)).toBe(2);
    lands(game, "Mountain", 5);
    activate(game, goliath, 0);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });
});

describe("Thranduil the Strategist", () => {
  it("other Elves tap for {G} or {U}; landfall makes an Elf", () => {
    const { game } = table();
    const thranduil = spawn(game, "Thranduil the Strategist");
    const visionary = spawn(game, "Elvish Visionary");
    activate(game, visionary, 0);
    const pool = game.state.players[A].manaPool;
    expect(pool).toHaveLength(1);
    expect(["G", "U"]).toContain(pool[0].type);
    expect(() => activate(game, thranduil, 0)).toThrow();
    enter(game, "Forest");
    expect(tokensNamed(game, "Elf Token", A)).toBe(1);
  });
});

describe("Monoxa, Midway Manager", () => {
  it("each roll's result decides first strike, menace and lifelink", () => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const { game } = table({ seed });
      const monoxa = spawn(game, "Monoxa, Midway Manager");
      lands(game, "Wastes", 6);
      activate(game, monoxa, 0);
      const roll = lastRoll(game);
      const kw = keywords(game, monoxa);
      expect(kw.has("first-strike")).toBe(roll >= 3);
      expect(kw.has("menace")).toBe(roll >= 4);
      expect(kw.has("lifelink")).toBe(roll >= 5);
    }
  });
});

describe("Boing!", () => {
  it("bounces the creature, then rolls", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Boing!"), { targets: [ref(bears)] });
    expect(handNames(game, B)).toContain("Grizzly Bears");
    expect(lastRoll(game)).toBeGreaterThanOrEqual(1);
  });
});

describe("Momo, Rambunctious Rascal", () => {
  it("4 damage to a tapped creature an opponent controls", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    pickTargets(a, giant);
    enter(game, "Momo, Rambunctious Rascal");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Imaryll, Elfhame Elite", () => {
  it("+X/+X for each other Elf as she attacks", () => {
    const { game, a } = table();
    const imaryll = spawn(game, "Imaryll, Elfhame Elite");
    spawn(game, "Llanowar Elves");
    spawn(game, "Llanowar Elves");
    attack(game, a, [imaryll]);
    expect(pt(game, imaryll)).toEqual({ power: 5, toughness: 5 });
    expect(life(game, B)).toBe(15);
  });
});

describe("Lethal Protection", () => {
  it("destroys a creature and returns a creature card", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const giant = spawn(game, "Hill Giant", B);
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Lethal Protection"), { targets: [ref(giant), ref(bears)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Study the Classics", () => {
  it("adds one, doubles, and gains life equal to the counters", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    addCounters(game, bears, "+1/+1", 1);
    cast(game, toHand(game, "Study the Classics"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(4);
    expect(life(game, A)).toBe(24);
  });
});

describe("Ellie and Alan, Paleontologists", () => {
  it("discovers X, the exiled card's mana value", () => {
    const { game } = table();
    const duo = spawn(game, "Ellie and Alan, Paleontologists");
    const giant = toGraveyard(game, "Hill Giant");
    toLibrary(game, "Craw Wurm");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Craw Wurm");
    activate(game, duo, 0);
    expect(zone(game, giant)).not.toBe("graveyard");
    // The 6-drop on top is passed over; the Bears (2 ≤ 3) is found and, the
    // cast declined, goes to the hand.
    expect(handNames(game)).toContain("Grizzly Bears");
    expect(handNames(game)).not.toContain("Craw Wurm");
  });
});

describe("Maeve, Insidious Singer", () => {
  it("goads a creature; it attacking an opponent of hers this turn draws her a card", () => {
    const { game, b } = table({ players: 3 });
    const maeve = spawn(game, "Maeve, Insidious Singer");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 3);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main" && s.priority.holder === A);
    activate(game, maeve, 0, { targets: [ref(giant)] });
    const before = hand(game).length;
    b.declareAttackersFn = () => [{ attacker: giant, defender: C }];
    toStep(game, "postcombat-main", B);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, C)).toBe(17);
  });
});

describe("Gandalf, Party Guest", () => {
  it("casts a spell of mana value up to twice his legendary Wizards free at combat", () => {
    const { game, a } = table();
    spawn(game, "Gandalf, Party Guest");
    toHand(game, "Shock");
    toHand(game, "Divination");
    let offered: string[] = [];
    a.chooseCastNowFn = (view, offer) => {
      offered = offer.cards.map((id) => view.state.objects[id].cardName);
      const card = offer.cards.find((id) => view.state.objects[id].cardName === "Shock");
      return card === undefined ? null : { type: "cast-spell", player: A, card, targets: [ref(B)], via: "effect", free: true };
    };
    toStep(game, "begin-combat");
    settle(game);
    expect(offered).toContain("Shock");
    expect(offered).not.toContain("Divination");
    expect(life(game, B)).toBe(18);
  });
});

describe("The Howling Abomination", () => {
  it("targeted by a spell, it grows and burns each opponent", () => {
    const { game } = table();
    const beast = spawn(game, "The Howling Abomination");
    expect(keywords(game, beast).has("trample")).toBe(false);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(beast)] });
    expect(pt(game, beast)).toEqual({ power: 10, toughness: 10 });
    expect(life(game, B)).toBe(18);
  });

  it("has trample after three spells", () => {
    const { game } = table();
    const beast = spawn(game, "The Howling Abomination");
    lands(game, "Mountain", 3);
    for (let i = 0; i < 3; i += 1) cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(keywords(game, beast).has("trample")).toBe(true);
  });
});

describe("Sophina, Spearsage Deserter", () => {
  it("a Clue for each nontoken attacker", () => {
    const { game, a } = table();
    const sophina = spawn(game, "Sophina, Spearsage Deserter");
    const bears = spawn(game, "Grizzly Bears");
    const token = makeToken(game, "Soldier Token");
    grant(game, token, "haste");
    attack(game, a, [sophina, bears, token]);
    expect(tokensNamed(game, "Clue Token", A)).toBe(2);
  });
});

describe("Sokka and Suki", () => {
  it("an entering Ally picks up an Equipment; an entering Equipment makes an Ally", () => {
    const { game, a } = table();
    spawn(game, "Sokka and Suki");
    const hammer = spawn(game, "Loxodon Warhammer");
    pickTargets(a, hammer);
    const sage = enter(game, "Loyal Fire Sage");
    expect(pt(game, sage)).toEqual({ power: 6, toughness: 3 });
    pickTargets(a, null);
    enter(game, "Bonesplitter");
    expect(tokensNamed(game, "Ally Token", A)).toBe(1);
  });
});

describe("Michelangelo, On the Scene", () => {
  it("enters with a counter per land; dying, it goes back to the hand", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const mikey = enter(game, "Michelangelo, On the Scene");
    expect(pt(game, mikey)).toEqual({ power: 6, toughness: 6 });
    destroy(game, mikey);
    expect(handNames(game)).toContain("Michelangelo, On the Scene");
  });
});

describe("Zuko, Seeking Honor", () => {
  it("a noncreature spell gives him first strike", () => {
    const { game } = table();
    const zuko = spawn(game, "Zuko, Seeking Honor");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(keywords(game, zuko).has("first-strike")).toBe(true);
  });
});

describe("Nathan Drake, Treasure Hunter", () => {
  it("exiles each top card and casts an opponent's spell, colorless mana paying its red", () => {
    const { game, a } = table();
    const nathan = spawn(game, "Nathan Drake, Treasure Hunter");
    lands(game, "Wastes", 1);
    toLibrary(game, "Shock", B);
    acceptCastNow(a, [ref(B)], false, "Shock");
    attack(game, a, [nathan]);
    expect(life(game, B)).toBe(15);
  });
});

describe("Lara Croft, Tomb Raider", () => {
  it("exiles a legendary artifact with a discovery counter; one card with one may be played this turn", () => {
    const { game, a } = table();
    const lara = spawn(game, "Lara Croft, Tomb Raider");
    const mox = toGraveyard(game, "Mox Amber", B);
    const urborg = toGraveyard(game, "Urborg, Tomb of Yawgmoth", B);
    game.debugApplyEffect(B, { kind: "exile", target: 0, withCounters: { kind: "discovery", amount: 1 } }, [ref(urborg)]);
    settle(game);
    pickTargets(a, mox);
    attack(game, a, [lara]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    const [exiledMox] = inExile(game, "Mox Amber");
    const [exiledUrborg] = inExile(game, "Urborg, Tomb of Yawgmoth");
    expect(counters(game, exiledMox, "discovery")).toBe(1);
    expect(castOffered(game, exiledMox)).toBe(true);
    expect(castOffered(game, exiledUrborg)).toBe(true);
    const offer = game.legalActions(A).find((o) => o.kind === "cast-spell" && o.card === exiledMox);
    if (offer?.kind !== "cast-spell") throw new Error("Mox Amber not offered");
    cast(game, exiledMox, { via: offer.via });
    expect(named(game, "Mox Amber", A)).toHaveLength(1);
    expect(castOffered(game, exiledUrborg)).toBe(false);
  });
});

describe("Soundwave, Sonic Spy", () => {
  it("a token's combat damage casts a copy of a matching instant, converting it; the Captain converts back with Ravage", () => {
    const { game, a } = table();
    const soundwave = spawn(game, "Soundwave, Sonic Spy");
    const token = makeToken(game, "Soldier Token");
    grant(game, token, "haste");
    const shock = toGraveyard(game, "Shock", B);
    pickTargets(a, shock);
    acceptCastNow(a, [ref(B)]);
    attack(game, a, [token]);
    expect(life(game, B)).toBe(17);
    expect(types(game, soundwave)).not.toContain("creature");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(types(game, soundwave)).toContain("creature");
    expect(tokensNamed(game, "Ravage Token", A)).toBe(1);
  });
});
