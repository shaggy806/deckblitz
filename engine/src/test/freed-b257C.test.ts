/**
 * B257, group C: cards freed by the attack-restriction, chosen-by-other-player,
 * dealt-damage-dies, per-player condition, on-resolution choice,
 * choose-permanent and per-player count families. One test per card that's more
 * than a stat line.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import { defendersForAttacker } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickPermanents,
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
  zone,
} from "./harness.js";

const burn = (game: Game, by: typeof A, target: ObjectId, amount: number): void => {
  game.debugApplyEffect(by, { kind: "damage", amount, target: 0 }, [ref(target)]);
  settle(game);
};

describe("B257 group C", () => {
  it("Whimwader attacks only a player with a blue permanent", () => {
    const { game } = table({ players: 3 });
    const whimwader = spawn(game, "Whimwader", A);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Merfolk of the Pearl Trident", C);
    expect(defendersForAttacker(game.state, game.registry, A, whimwader)).toEqual([C]);
  });

  it("Dread Slaver takes what it killed as a black Zombie, even dying with it", () => {
    const { game, a, b } = table();
    const slaver = spawn(game, "Dread Slaver", A);
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: slaver }];
    burn(game, A, slaver, 2); // 3 more from the Giant kills it too
    attack(game, a, [slaver]);
    expect(zone(game, slaver)).toBe("graveyard");
    const [back] = named(game, "Hill Giant", A);
    expect(back).toBeDefined();
    expect(subtypes(game, back)).toContain("Zombie");
    expect(subtypes(game, back)).toContain("Giant");
    expect([...computeCharacteristics(game.state, game.registry, back).colors]).toEqual(expect.arrayContaining(["R", "B"]));
    expect(controller(game, back)).toBe(A);
  });

  it("Markov Enforcer fights for another Vampire, and a Blood token follows", () => {
    const { game, a } = table();
    spawn(game, "Markov Enforcer", A);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Vampire Nighthawk", A);
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Blood Token", A)).toBe(1);
  });

  it("Hoard Hauler makes a Treasure for each artifact the damaged player controls", () => {
    const { game, a } = table({ players: 3 });
    const hauler = spawn(game, "Hoard Hauler", A);
    spawn(game, "Sol Ring", A);
    spawn(game, "Sol Ring", B);
    spawn(game, "Mind Stone", B);
    spawn(game, "Sol Ring", C);
    game.debugApplyEffect(A, { kind: "add-types", target: 0, addTypes: ["creature"], duration: "end-of-turn" }, [ref(hauler)]);
    attack(game, a, [hauler]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });

  it("Impending Disaster counts every player's lands", () => {
    const { game } = table();
    const disaster = spawn(game, "Impending Disaster", A);
    const mine = lands(game, "Wastes", 3, A);
    const theirs = lands(game, "Wastes", 4, B);
    toStep(game, "draw", A);
    expect(zone(game, disaster)).toBe("graveyard");
    expect(zone(game, mine[0])).toBe("graveyard");
    expect(zone(game, theirs[0])).toBe("graveyard");
  });

  it("Impending Disaster stays with six lands out", () => {
    const { game } = table();
    const disaster = spawn(game, "Impending Disaster", A);
    lands(game, "Wastes", 6, B);
    toStep(game, "draw", A);
    expect(zone(game, disaster)).toBe("battlefield");
  });

  it("Arcum's Sleigh needs combat and a defending player's snow land", () => {
    const { game, a } = table({ players: 3 });
    const sleigh = spawn(game, "Arcum's Sleigh", A);
    lands(game, "Wastes", 2, A);
    lands(game, "Snow-Covered Forest", 1, C);
    const bears = spawn(game, "Grizzly Bears", A);
    const offer = { type: "activate-ability", player: A, source: sleigh, abilityIndex: 0, targets: [ref(bears)] } as const;
    expect(game.canDispatch(offer)).not.toBeNull();
    // Attacking the player without one: no.
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    afterAttackers(game);
    expect(game.canDispatch(offer)).toMatch(/condition/);
  });

  it("Arcum's Sleigh activates against a snow land", () => {
    const { game, a } = table({ players: 3 });
    const sleigh = spawn(game, "Arcum's Sleigh", A);
    lands(game, "Wastes", 2, A);
    lands(game, "Snow-Covered Forest", 1, C);
    const bears = spawn(game, "Grizzly Bears", A);
    a.declareAttackersFn = () => [{ attacker: bears, defender: C }];
    afterAttackers(game);
    activate(game, sleigh, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
  });

  it("Siege Dragon burns the nonflyers of a player with no Walls, and spares one with a Wall", () => {
    const { game, a } = table({ players: 3 });
    const dragon = spawn(game, "Siege Dragon", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const flyer = spawn(game, "Wind Drake", B);
    const carols = spawn(game, "Grizzly Bears", C);
    a.declareAttackersFn = () => [{ attacker: dragon, defender: B }];
    afterAttackers(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, flyer)).toBe("battlefield");
    expect(zone(game, carols)).toBe("battlefield");
  });

  it("Siege Dragon does nothing against a Wall, and destroys only opponents' Walls as it enters", () => {
    const { game, a } = table();
    const mine = spawn(game, "Wall of Omens", A);
    const theirs = spawn(game, "Wall of Omens", B);
    const dragon = enter(game, "Siege Dragon", A);
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("graveyard");
    const wall = spawn(game, "Wall of Omens", B);
    const bears = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: dragon, defender: B }];
    afterAttackers(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, wall)).toBe("battlefield");
  });

  it("Siege Dragon's damage still happens with the Dragon gone", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Siege Dragon", A);
    const bears = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: dragon, defender: B }];
    game.advanceUntil((s) => s.zones.shared.stack.length === 1);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(dragon)]);
    settle(game);
    expect(zone(game, dragon)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Ayli exiles only at ten over starting life", () => {
    const { game, a } = table();
    const ayli = spawn(game, "Ayli, Eternal Pilgrim", A);
    lands(game, "Plains", 1, A);
    lands(game, "Swamp", 1, A);
    lands(game, "Wastes", 1, A);
    const fodder = spawn(game, "Grizzly Bears", A);
    const victim = spawn(game, "Sol Ring", B);
    const offer = { type: "activate-ability", player: A, source: ayli, abilityIndex: 1, targets: [ref(victim)], sacrifice: fodder } as const;
    expect(game.canDispatch(offer)).not.toBeNull();
    game.debugApplyEffect(A, { kind: "gain-life", amount: 10 }, []);
    pickTargets(a, victim);
    game.dispatch(offer);
    settle(game);
    expect(zone(game, victim)).toBe("exile");
    expect(zone(game, fodder)).toBe("graveyard");
  });

  it("Path of Bravery's anthem ends below starting life, and it gains for each attacker", () => {
    const { game, a } = table();
    spawn(game, "Path of Bravery", A);
    const one = spawn(game, "Grizzly Bears", A);
    const two = spawn(game, "Grizzly Bears", A);
    expect(pt(game, one)).toEqual({ power: 3, toughness: 3 });
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1, who: "you" }, []);
    expect(pt(game, one)).toEqual({ power: 2, toughness: 2 });
    attack(game, a, [one, two]);
    expect(life(game, A)).toBe(21);
    expect(pt(game, one)).toEqual({ power: 3, toughness: 3 });
    expect(life(game, B)).toBe(14); // 3 each: the life gained brought the anthem back before damage
  });

  it("Descendant of Kiyomaro gains 3 once for two blockers, and only with the larger hand", () => {
    const { game, a, b } = table();
    const descendant = spawn(game, "Descendant of Kiyomaro", A);
    while (hand(game, B).length < hand(game, A).length) toHand(game, "Wastes", B);
    expect(pt(game, descendant)).toEqual({ power: 2, toughness: 3 });
    toHand(game, "Wastes", A);
    expect(pt(game, descendant)).toEqual({ power: 3, toughness: 5 });
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [
      { blocker: one, attacker: descendant },
      { blocker: two, attacker: descendant },
    ];
    attack(game, a, [descendant]);
    expect(life(game, A)).toBe(23);
  });

  it("Advice from the Fae: a tie with one player is one card", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Island", 3, A);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", C);
    spawn(game, "Grizzly Bears", C);
    expect(game.registry.get("Advice from the Fae").colors).toEqual(["U"]);
    const before = hand(game, A).length;
    const spell = toHand(game, "Advice from the Fae", A);
    a.chooseFromZoneFn = (_v, eligible, min) => eligible.slice(0, min);
    cast(game, spell);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Advice from the Fae: more than each other player is two cards", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Island", 3, A);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", C);
    const before = hand(game, A).length;
    const spell = toHand(game, "Advice from the Fae", A);
    a.chooseFromZoneFn = (_v, eligible, min) => eligible.slice(0, min);
    cast(game, spell);
    expect(hand(game, A).length).toBe(before + 2);
  });

  it("Thought-Stalker Warlock: a choice from the hand only if they lost life this turn", () => {
    const { game, a, b } = table();
    const bearsCard = toHand(game, "Grizzly Bears", B);
    pickTargets(a, B);
    let choseFromHand = false;
    b.chooseDiscardsFn = (cards, count) => cards.slice(0, count).map((c) => c.id);
    enter(game, "Thought-Stalker Warlock", A);
    expect(zone(game, bearsCard)).toBe("hand"); // bob's own choice: the first card, a Wastes

    game.debugApplyEffect(A, { kind: "lose-life", amount: 1, who: "each-opponent" }, []);
    a.chooseFromZoneFn = (_v, eligible) => {
      choseFromHand = true;
      expect(eligible).toContain(bearsCard);
      return [bearsCard];
    };
    enter(game, "Thought-Stalker Warlock", A);
    expect(choseFromHand).toBe(true);
    expect(zone(game, bearsCard)).toBe("graveyard");
  });

  it("Bonder's Ornament draws for each player with one, once each", () => {
    const { game } = table({ players: 3 });
    const ornament = spawn(game, "Bonder's Ornament", A);
    spawn(game, "Bonder's Ornament", A);
    spawn(game, "Bonder's Ornament", B);
    lands(game, "Wastes", 4, A);
    const [ha, hb, hc] = [hand(game, A).length, hand(game, B).length, hand(game, C).length];
    activate(game, ornament, 1);
    expect(hand(game, A).length).toBe(ha + 1);
    expect(hand(game, B).length).toBe(hb + 1);
    expect(hand(game, C).length).toBe(hc);
  });

  it("Shatter the Sky draws for power 4 or greater, then destroys all", () => {
    const { game } = table();
    lands(game, "Plains", 4, A);
    const big = spawn(game, "Air Elemental", B);
    const small = spawn(game, "Grizzly Bears", A);
    const [ha, hb] = [hand(game, A).length, hand(game, B).length];
    cast(game, toHand(game, "Shatter the Sky", A));
    expect(hand(game, A).length).toBe(ha);
    expect(hand(game, B).length).toBe(hb + 1);
    expect(zone(game, big)).toBe("graveyard");
    expect(zone(game, small)).toBe("graveyard");
  });

  it("Hollowborn Barghest's second ability reads the upkeep's opponent", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Hollowborn Barghest", A);
    for (const id of [...hand(game, B)]) game.state.objects[id].zone = "graveyard";
    game.state.zones.perPlayer[B].hand.length = 0;
    toStep(game, "draw", B);
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(20);
  });

  it("Wolfcaller's Howl counts the opponents with four or more cards", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Wolfcaller's Howl", A);
    game.state.zones.perPlayer[C].hand.length = 1; // 2 after their draw
    toStep(game, "draw", A);
    expect(tokensNamed(game, "Wolf Token", A)).toBe(1);
  });

  it("Dragonlord's Prerogative can't be countered with a Dragon out, and can without", () => {
    const { game } = table();
    lands(game, "Island", 12, A);
    const dragon = spawn(game, "Shivan Dragon", A);
    const before = hand(game, A).length;
    const safe = toHand(game, "Dragonlord's Prerogative", A);
    cast(game, safe, { settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(safe)]);
    settle(game);
    expect(hand(game, A).length).toBe(before + 4);

    destroy(game, dragon);
    const after = hand(game, A).length;
    const open = toHand(game, "Dragonlord's Prerogative", A);
    cast(game, open, { settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(open)]);
    settle(game);
    expect(zone(game, open)).toBe("graveyard");
    expect(hand(game, A).length).toBe(after);
  });

  it("Oona makes a Faerie Rogue for each exiled card of the color chosen as it resolves", () => {
    const { game, a } = table();
    const oona = spawn(game, "Oona, Queen of the Fae", A);
    lands(game, "Swamp", 4, A);
    toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Merfolk of the Pearl Trident", B);
    toLibrary(game, "Wind Drake", B);
    a.chooseCreatureTypeFn = (_v, _s, options) => options.find((o) => o === "U" || /blue/i.test(o)) ?? options[0];
    pickTargets(a, B);
    activate(game, oona, 0, { targets: [ref(B)], x: 3 });
    expect(tokensNamed(game, "Blue-Black Faerie Rogue Token", A)).toBe(2);
  });

  it("Sungold Sentinel: coven, hexproof from the color and unblockable by it", () => {
    const { game, a } = table();
    const sentinel = spawn(game, "Sungold Sentinel", A);
    lands(game, "Plains", 4, A);
    const offer = { type: "activate-ability", player: A, source: sentinel, abilityIndex: 0, targets: [] } as const;
    expect(game.canDispatch(offer)).not.toBeNull();
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Llanowar Elves", A);
    a.chooseCreatureTypeFn = (_v, _s, options) => options.find((o) => o === "R" || /red/i.test(o)) ?? options[0];
    activate(game, sentinel, 0);
    const shock = toHand(game, "Shock", B);
    lands(game, "Mountain", 1, B);
    expect(game.canDispatch({ type: "cast-spell", player: B, card: shock, targets: [ref(sentinel)] })).not.toBeNull();
    const goblin = spawn(game, "Goblin Piker", B);
    const elf = spawn(game, "Llanowar Elves", B);
    a.declareAttackersFn = () => [{ attacker: sentinel, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    const blocks = game.legalActions(B).find((o) => o.kind === "declare-blockers");
    const can = JSON.stringify(blocks);
    expect(can).toContain(elf);
    expect(can).not.toContain(goblin);
  });

  it("Xavier Sal pays with another permanent's counter to populate", () => {
    const { game } = table();
    const xavier = spawn(game, "Xavier Sal, Infested Captain", A);
    const mine = spawn(game, "Grizzly Bears", A);
    game.state.objects[mine].counters = { "+1/+1": 1 };
    game.debugApplyEffect(A, { kind: "create-token", token: "Wolf Token", count: 1 }, []);
    settle(game);
    activate(game, xavier, 0);
    expect(counters(game, mine)).toBe(0);
    expect(tokensNamed(game, "Wolf Token", A)).toBe(2);
  });

  it("Xavier Sal's own counter can't pay", () => {
    const { game } = table();
    const xavier = spawn(game, "Xavier Sal, Infested Captain", A);
    game.state.objects[xavier].counters = { "+1/+1": 1 };
    expect(game.canDispatch({ type: "activate-ability", player: A, source: xavier, abilityIndex: 0, targets: [] })).not.toBeNull();
  });

  it("Rising Waters: lands stay tapped, and each player untaps one of theirs at upkeep", () => {
    const { game, b } = table();
    spawn(game, "Rising Waters", A);
    const one = spawn(game, "Wastes", B, { tapped: true });
    const two = spawn(game, "Wastes", B, { tapped: true });
    const seen = pickPermanents(b, two);
    toStep(game, "draw", B);
    expect(seen.offered).toContain(one);
    expect(game.state.objects[one].tapped).toBe(true);
    expect(game.state.objects[two].tapped).toBe(false);
  });

  it("Gerrard Capashen gains for the target opponent's hand, and taps only while attacking", () => {
    const { game, a } = table({ players: 3 });
    const gerrard = spawn(game, "Gerrard Capashen", A);
    lands(game, "Plains", 4, A);
    game.state.zones.perPlayer[C].hand.length = 1; // 2 after their draw
    const bears = spawn(game, "Grizzly Bears", B);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: gerrard, abilityIndex: 0, targets: [ref(bears)] })).not.toBeNull();
    pickTargets(a, C);
    toStep(game, "draw", A);
    expect(life(game, A)).toBe(22);
  });

  const distinctHand = (game: Game, cards: readonly string[]): void => {
    const hands = game.state.zones.perPlayer[A].hand;
    hands.length = 0;
    for (const name of cards) toHand(game, name, A);
  };

  it("Atemsis: six different mana values lose the game for the damaged player", () => {
    const { game, a } = table({ players: 3 });
    const atemsis = spawn(game, "Atemsis, All-Seeing", A);
    distinctHand(game, ["Wastes", "Shock", "Grizzly Bears", "Divination", "Zombify", "Mulldrifter"]);
    pickModes(a, 0);
    attack(game, a, [atemsis]);
    expect(game.state.players[B].hasLost).toBe(true);
    expect(game.state.players[C].hasLost).toBe(false);
  });

  it("Atemsis: five don't, whatever the count of cards; declining reveals nothing", () => {
    const { game, a } = table({ players: 3 });
    const atemsis = spawn(game, "Atemsis, All-Seeing", A);
    distinctHand(game, ["Wastes", "Wastes", "Shock", "Grizzly Bears", "Divination", "Air Elemental", "Air Elemental"]);
    pickModes(a, 0);
    attack(game, a, [atemsis]);
    expect(game.state.players[B].hasLost).toBe(false);
  });

  it("Celebrate the Harvest finds one land for each different power", () => {
    const { game, a } = table({ deck: "Forest" });
    lands(game, "Forest", 4, A);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Air Elemental", A);
    let most = 0;
    a.chooseFromZoneFn = (_v, eligible, _min, max) => {
      most = max;
      return eligible.slice(0, max);
    };
    const forests = named(game, "Forest", A).length;
    cast(game, toHand(game, "Celebrate the Harvest", A));
    expect(most).toBe(2);
    expect(named(game, "Forest", A).length).toBe(forests + 2);
  });

  it("Armament Master counts what's attached to itself, not to the other Kor", () => {
    const { game } = table();
    const master = spawn(game, "Armament Master", A);
    const kor = spawn(game, "Ayli, Eternal Pilgrim", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const sword = spawn(game, "Bonesplitter", A);
    expect(pt(game, kor)).toEqual({ power: 2, toughness: 3 });
    game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: 1 }, [ref(master), ref(sword)]);
    expect(pt(game, kor)).toEqual({ power: 4, toughness: 5 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, master).toughness).toBe(2);
  });

  it("The Long Reach of Night: a discard saves the creature, and no discard loses it", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b, 0);
    const handBefore = hand(game, B).length;
    enter(game, "The Long Reach of Night", A);
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game, B).length).toBe(handBefore - 1);
  });

  it("The Long Reach of Night: declining the discard, they sacrifice", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b);
    const handBefore = hand(game, B).length;
    enter(game, "The Long Reach of Night", A);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, B).length).toBe(handBefore);
  });

  it("Animus of Night's Reach gets +X/+0 from the defending player's graveyard", () => {
    const { game, a } = table({ players: 3 });
    // Chapter III turns the Saga over, a new object (rule 712).
    const saga = spawn(game, "The Long Reach of Night", A);
    game.state.objects[saga].counters = { lore: 2 };
    toStep(game, "postcombat-main", A);
    toStep(game, "precombat-main", A);
    settle(game);
    const animus = game.battlefield.find((id) => game.state.objects[id].owner === A && pt(game, id).toughness === 4);
    if (animus === undefined) throw new Error("no Animus");
    game.state.objects[animus].summoningSick = false;
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Hill Giant", B);
    toGraveyard(game, "Shock", B);
    toGraveyard(game, "Grizzly Bears", C);
    toGraveyard(game, "Grizzly Bears", A);
    a.declareAttackersFn = () => [{ attacker: animus, defender: B }];
    afterAttackers(game);
    expect(pt(game, animus)).toEqual({ power: 2, toughness: 4 });
    expect(graveyard(game, B).length).toBe(3);
  });
});

/** Attackers declared and every trigger of that resolved, alice's priority. */
function afterAttackers(game: Game): void {
  game.advanceUntil(
    (s) =>
      s.turn.step === "declare-attackers" &&
      s.awaiting === null &&
      s.zones.shared.stack.length === 0 &&
      s.pendingTriggers.length === 0 &&
      s.priority.holder === A,
  );
}
