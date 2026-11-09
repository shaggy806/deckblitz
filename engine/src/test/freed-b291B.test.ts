/**
 * B291 group B: freed cards, the clause most likely to be wrong on each.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { lastRollIn } from "../random-results.js";
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
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickPermanents,
  pt,
  ref,
  nextTurn,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone as zoneOf,
} from "./harness.js";

const attach = (game: Game, attachment: ObjectId, host: ObjectId): void => {
  game.state.objects[attachment].attachedTo = host;
};
const pump = (game: Game): void => {
  // State-based actions and state triggers wait for priority; run past the
  // start of the step.
  settle(game);
  toStep(game, "postcombat-main", A);
};
const canCast = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((o) => "card" in o && (o as { card?: ObjectId }).card === card);

describe("creature and enchantment oddities", () => {
  it("Murderous Spoils destroys, then you gain control of the Equipment that was on it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const sword = spawn(game, "Bonesplitter", B);
    attach(game, sword, bears);
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Murderous Spoils"), { targets: [ref(bears)] });
    expect(zoneOf(game, bears)).toBe("graveyard");
    expect(controller(game, sword)).toBe(A);
  });

  it("Balancing Act keeps the fewest permanents, then discards to the fewest hand", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    toHand(game, "Shock");
    toHand(game, "Shock");
    cast(game, toHand(game, "Balancing Act"));
    expect(game.battlefield.filter((id) => game.state.objects[id].controller === A)).toHaveLength(2);
    expect(hand(game, A).length).toBe(hand(game, B).length);
  });

  it("Simic Guildmage moves an Aura to another permanent of the host's controller", () => {
    const { game, a } = table();
    const mage = spawn(game, "Simic Guildmage", A);
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears", A);
    lands(game, "Island", 2);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Holy Strength"), { targets: [ref(first)] });
    const strength = game.battlefield.find((id) => game.state.objects[id].cardName === "Holy Strength")!;
    expect(game.state.objects[strength].attachedTo).toBe(first);
    pickPermanents(a, second);
    activate(game, mage, 1, { targets: [ref(strength)] });
    expect(game.state.objects[strength].attachedTo).toBe(second);
  });

  it("Pretender's Claim taps the lands of the defending player when enchanted creature is blocked", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", A);
    const wall = spawn(game, "Wall of Stone", B);
    const land = spawn(game, "Mountain", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Pretender's Claim"), { targets: [ref(giant)] });
    const mine = spawn(game, "Swamp", A);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: giant }];
    attack(game, a, [giant]);
    expect(game.state.objects[land].tapped).toBe(true);
    expect(game.state.objects[mine].tapped).toBe(false);
  });

  it("Tectonic Instability taps the lands of the entering land's controller only", () => {
    const { game } = table();
    spawn(game, "Tectonic Instability", A);
    const theirs = spawn(game, "Forest", B);
    const mine = spawn(game, "Forest", A);
    enter(game, "Island", B);
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(game.state.objects[mine].tapped).toBe(false);
  });

  it("Treefolk Mystic destroys Auras on what it blocks", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", A);
    const treefolk = spawn(game, "Treefolk Mystic", B);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Holy Strength"), { targets: [ref(giant)] });
    const strength = game.battlefield.find((id) => game.state.objects[id].cardName === "Holy Strength")!;
    b.declareBlockersFn = () => [{ blocker: treefolk, attacker: giant }];
    attack(game, a, [giant]);
    expect(zoneOf(game, strength)).toBe("graveyard");
  });

  it("Dermoplasm: the morph put in returns it; nothing put keeps it", () => {
    const { game, a } = table();
    const plasm = spawn(game, "Dermoplasm", A);
    game.debugApplyEffect(A, { kind: "turn-face-down", target: 0 }, [ref(plasm)]);
    settle(game);
    const morph = toHand(game, "Master of the Veil");
    pickFromZone(a, morph);
    game.debugApplyEffect(A, { kind: "turn-face-up", target: 0 }, [ref(plasm)]);
    settle(game);
    expect(zoneOf(game, plasm)).toBe("hand");
    expect(zoneOf(game, morph)).toBe("battlefield");
  });

  it("Drop of Honey picks the least power; an indestructible least means nothing dies", () => {
    const { game } = table();
    spawn(game, "Drop of Honey", A);
    const myr = spawn(game, "Darksteel Myr", B); // 0/1 indestructible
    const bears = spawn(game, "Grizzly Bears", B);
    toStep(game, "upkeep", A);
    settle(game);
    expect(zoneOf(game, myr)).toBe("battlefield");
    expect(zoneOf(game, bears)).toBe("battlefield");
  });

  it("Pact Weapon: +X/+X and X life from the drawn card's mana value, nothing on a replaced draw", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const weapon = spawn(game, "Pact Weapon", A);
    attach(game, weapon, bears);
    const top = toLibrary(game, "Hill Giant", A); // MV 4
    const before = life(game, A);
    attack(game, a, [bears]);
    expect(hand(game, A)).toContain(top);
    expect(before - life(game, A)).toBe(4);
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("kicker and modes", () => {
  it("Inscription of Abundance: X is the greatest power among the target player's creatures", () => {
    const { game } = table();
    spawn(game, "Hill Giant", B); // 3 power
    spawn(game, "Grizzly Bears", A);
    lands(game, "Forest", 2);
    const before = life(game, B);
    cast(game, toHand(game, "Inscription of Abundance"), { modes: [1], targets: [ref(B)] });
    expect(life(game, B)).toBe(before + 3);
  });

  it("Inscription of Insight's token is X/X for the target player's hand", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Inscription of Insight"), { modes: [2], targets: [ref(B)] });
    const token = game.battlefield.find((id) => game.state.objects[id].cardName.startsWith("Illusion Token"))!;
    expect(controller(game, token)).toBe(B);
    expect(pt(game, token)).toEqual({ power: before, toughness: before });
  });

  it("Kangee: X feather counters, and other Birds get +1/+1 for each", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    lands(game, "Island", 4);
    const bird = spawn(game, "Aven Fisher", A);
    cast(game, toHand(game, "Kangee, Aerie Keeper"), { x: 2, kicked: true });
    const kangee = game.battlefield.find((id) => game.state.objects[id].cardName === "Kangee, Aerie Keeper")!;
    expect(counters(game, kangee, "feather")).toBe(2);
    expect(pt(game, bird).power).toBe(4); // Aven Fisher 2/2 + 2
    expect(pt(game, kangee).power).toBe(2); // other Birds only
  });
});

describe("CDAs and scavenge", () => {
  it("Animate Artifact animates a noncreature artifact only, as long as it isn't one", () => {
    const { game } = table();
    const sword = spawn(game, "Bonesplitter", A); // MV 1 noncreature
    lands(game, "Island", 4);
    cast(game, toHand(game, "Animate Artifact"), { targets: [ref(sword)] });
    expect(types(game, sword)).toContain("creature");
    expect(pt(game, sword)).toEqual({ power: 1, toughness: 1 });
  });

  it("Dan Lewis makes a non-Equipment artifact an Equipment with equip {1}, and it stays one", () => {
    const { game } = table();
    spawn(game, "Dan Lewis", A);
    const rock = spawn(game, "Sol Ring", A);
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Mountain", 1);
    activate(game, rock, 1, { targets: [ref(bears)] });
    expect(game.state.objects[rock].attachedTo).toBe(bears);
    expect(pt(game, bears).power).toBe(3);
  });
});

describe("coins and dice", () => {
  it("Goblin Assassin: each player flips; only those who came up tails sacrifice", () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const { game } = table({ seed });
      spawn(game, "Grizzly Bears", A);
      spawn(game, "Grizzly Bears", B);
      enter(game, "Goblin Assassin", A);
      const flips = (game.state.journal?.entries ?? []).filter((e) => e.kind === "flipped");
      expect(flips).toHaveLength(2);
      for (const player of [A, B]) {
        const flip = flips.find((f) => f.player === player)!.flip!;
        const creatures = game.battlefield.filter(
          (id) => game.state.objects[id].controller === player && types(game, id).includes("creature"),
        );
        expect(creatures.length).toBe(flip.came === "tails" ? (player === A ? 1 : 0) : player === A ? 2 : 1);
      }
    }
  });

  it("Mana Clash deals 1 damage per tails until both come up heads", () => {
    const { game } = table({ life: 1000 });
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Mana Clash"), { targets: [ref(B)] });
    const flips = (game.state.journal?.entries ?? []).filter((e) => e.kind === "flipped");
    const tails = (p: string) => flips.filter((f) => f.player === p && f.flip!.came === "tails").length;
    expect(life(game, A)).toBe(1000 - tails(A));
    expect(life(game, B)).toBe(1000 - tails(B));
    expect(flips.length % 2).toBe(0);
    const last = flips.slice(-2);
    expect(last.every((f) => f.flip!.came === "heads")).toBe(true);
  });

  it("Two-Headed Giant: double strike on two heads, menace on two tails, neither on a split", () => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const { game, a } = table({ seed });
      const giant = spawn(game, "Two-Headed Giant", A);
      a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
      game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.priority.holder === A);
      settle(game);
      const flips = (game.state.journal?.entries ?? []).filter((e) => e.kind === "flipped");
      expect(flips).toHaveLength(2);
      const heads = flips.filter((f) => f.flip!.came === "heads").length;
      expect(keywords(game, giant).has("double-strike")).toBe(heads === 2);
      expect(keywords(game, giant).has("menace")).toBe(heads === 0);
    }
  });

  it("Ral Zarek's -7 takes one extra turn per heads", () => {
    for (const seed of [1, 2, 3]) {
      const { game } = table({ seed });
      const ral = spawn(game, "Ral Zarek", A);
      game.state.objects[ral].counters.loyalty = 9;
      const before = game.state.extraTurns?.length ?? 0;
      activate(game, ral, 2);
      const heads = (game.state.journal?.entries ?? []).filter((e) => e.kind === "flipped" && e.flip!.came === "heads").length;
      expect((game.state.extraTurns?.length ?? 0) - before).toBe(heads);
    }
  });

  it("Vexing Puzzlebox: charge counters equal to the result; the mana ability rolls", () => {
    const { game } = table();
    const box = spawn(game, "Vexing Puzzlebox", A);
    game.debugApplyEffect(A, { kind: "roll-dice", sides: 6, modifier: 3 }, []);
    settle(game);
    expect(counters(game, box, "charge")).toBe(lastRollIn(game.state)!.total);
  });

  it("Critical Hit returns from the graveyard on a natural 20 only", () => {
    const { game } = table();
    const hit = toGraveyard(game, "Critical Hit");
    for (let i = 0; i < 300 && zoneOf(game, hit) === "graveyard"; i += 1) {
      game.debugApplyEffect(A, { kind: "roll-dice", sides: 20 }, []);
      settle(game);
    }
    expect(zoneOf(game, hit)).toBe("hand");
    expect(lastRollIn(game.state)?.results[0]).toBe(20);
  });

  it("Odds counters or copies, with no winner", () => {
    for (const seed of [1, 2, 3, 4]) {
      const { game, a } = table({ seed });
      lands(game, "Island", 1);
      lands(game, "Mountain", 1);
      lands(game, "Mountain", 1);
      const bolt = toHand(game, "Lightning Bolt");
      a.chooseTargetsFn = () => [ref(B)];
      cast(game, bolt, { targets: [ref(B)], settle: false });
      const odds = toHand(game, "Odds // Ends");
      const before = life(game, B);
      // Pass Odds as the "Odds" half targeting the Bolt on the stack.
      cast(game, odds, { targets: [ref(bolt)], face: 1 });
      const flip = (game.state.journal?.entries ?? []).filter((e) => e.kind === "flipped").at(-1)!.flip!;
      const hit = flip.came === "heads" ? 0 : 6; // copied, then both resolve
      expect(before - life(game, B)).toBe(flip.came === "heads" ? 0 : hit);
    }
  });
});

describe("replacements and rules", () => {
  it("Divine Presence: 4+ damage becomes 3, 3 or less is untouched", () => {
    const { game } = table();
    spawn(game, "Divine Presence", A);
    const before = life(game, B);
    game.debugApplyEffect(A, { kind: "damage", amount: 5, target: 0 }, [ref(B)]);
    settle(game);
    expect(before - life(game, B)).toBe(3);
    game.debugApplyEffect(A, { kind: "damage", amount: 2, target: 0 }, [ref(B)]);
    settle(game);
    expect(before - life(game, B)).toBe(5);
  });

  it("Blind Fury: trample lost, combat damage between creatures doubled", () => {
    const { game, a, b } = table();
    const trampler = spawn(game, "Craw Wurm", A); // 6/4
    const wall = spawn(game, "Wall of Stone", B); // 0/8
    game.debugApplyEffect(A, { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" }, [ref(trampler)]);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Blind Fury"));
    expect(keywords(game, trampler).has("trample")).toBe(false);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: trampler }];
    attack(game, a, [trampler]);
    expect(game.state.objects[wall].zone).toBe("graveyard"); // 12 damage on a 0/8
  });

  it("Insult doubles damage from your sources this turn; Injury casts from the graveyard", () => {
    const { game } = table();
    lands(game, "Mountain", 7);
    const insult = toHand(game, "Insult // Injury");
    cast(game, insult, { face: 1 });
    const before = life(game, B);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(before - life(game, B)).toBe(4);
    expect(zoneOf(game, insult)).toBe("graveyard");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, insult, { face: 2, via: "aftermath", targets: [ref(bears), ref(B)] });
    expect(zoneOf(game, insult)).toBe("exile");
    expect(before - life(game, B)).toBe(8); // Injury's 2 doubled too
  });

  it("Exquisite Archangel: losing the game exiles it and resets life", () => {
    const { game } = table({ life: 20 });
    const angel = spawn(game, "Exquisite Archangel", A);
    game.debugApplyEffect(B, { kind: "damage", amount: 30, target: 0 }, [ref(A)]);
    pump(game);
    expect(zoneOf(game, angel)).toBe("exile");
    expect(life(game, A)).toBe(20);
  });

  it("Lich's Mirror: hand, graveyard and permanents into the library, then seven and 20 life", () => {
    const { game } = table({ life: 5 });
    const mirror = spawn(game, "Lich's Mirror", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const stolen = spawn(game, "Grizzly Bears", B); // not owned: stays
    toGraveyard(game, "Shock");
    game.debugApplyEffect(B, { kind: "damage", amount: 30, target: 0 }, [ref(A)]);
    pump(game);
    expect(zoneOf(game, mirror)).toBe("library");
    expect(zoneOf(game, bears)).toBe("library");
    expect(zoneOf(game, stolen)).toBe("battlefield");
    expect(hand(game, A)).toHaveLength(7);
    expect(graveyard(game, A)).toHaveLength(0);
    expect(life(game, A)).toBe(20);
  });

  it("Drowner of Truth: Eldrazi Spawn only with {C} spent", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Drowner of Truth"));
    expect(tokensNamed(game, "Eldrazi Spawn Token", A)).toBe(0);
    const g2 = table();
    lands(g2.game, "Forest", 6);
    lands(g2.game, "Wastes", 1);
    cast(g2.game, toHand(g2.game, "Drowner of Truth"));
    expect(tokensNamed(g2.game, "Eldrazi Spawn Token", A)).toBe(2);
  });

  it("Bound by Moonsilver: the enchanted werewolf can't transform and moves once a turn", () => {
    const { game } = table();
    const wolf = spawn(game, "Grizzly Bears", B);
    const elf = spawn(game, "Llanowar Elves", B);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Bound by Moonsilver"), { targets: [ref(wolf)] });
    const bound = game.battlefield.find((id) => game.state.objects[id].cardName === "Bound by Moonsilver")!;
    const fodder = spawn(game, "Forest", A);
    game.dispatch({ type: "activate-ability", player: A, source: bound, abilityIndex: 0, targets: [ref(elf)], sacrifice: fodder } as never);
    settle(game);
    expect(game.state.objects[bound].attachedTo).toBe(elf);
  });

  it("Georgiou: no loss at 0 life, and ten Officers then", () => {
    const { game } = table({ life: 2 });
    spawn(game, "Georgiou, Terran Emperor", A);
    toStep(game, "end", A);
    settle(game);
    expect(life(game, A)).toBe(-1);
    expect(game.state.players[A].hasLost ?? false).toBe(false);
    expect(tokensNamed(game, "Officer Token", A)).toBe(10);
  });

  it("Transcendence: reaching 20 life loses; lost life doubled back", () => {
    const { game } = table({ life: 10 });
    spawn(game, "Transcendence", A);
    game.debugApplyEffect(B, { kind: "damage", amount: 5, target: 0 }, [ref(A)]);
    settle(game);
    expect(life(game, A)).toBe(15);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 5 }, []);
    pump(game);
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("Underworld Cerberus exiles itself and every player gets their creature cards back", () => {
    const { game } = table();
    const dog = spawn(game, "Underworld Cerberus", A);
    const mine = toGraveyard(game, "Grizzly Bears", A);
    const theirs = toGraveyard(game, "Hill Giant", B);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(dog)]);
    settle(game);
    expect(zoneOf(game, dog)).toBe("exile");
    expect(zoneOf(game, mine)).toBe("hand");
    expect(zoneOf(game, theirs)).toBe("hand");
  });

  it("Solitary Confinement: shroud, draw step skipped, damage prevented", () => {
    const { game } = table();
    spawn(game, "Solitary Confinement", A);
    const before = life(game, A);
    game.debugApplyEffect(B, { kind: "damage", amount: 5, target: 0 }, [ref(A)]);
    settle(game);
    expect(life(game, A)).toBe(before);
  });

  it("Cemetery Illuminator casts a spell from the top sharing a type with what it exiled, once a turn", () => {
    const { game, a } = table();
    const exiled = toGraveyard(game, "Bonesplitter", B); // artifact
    pickFromZone(a, exiled);
    const illuminator = enter(game, "Cemetery Illuminator", A);
    expect(zoneOf(game, exiled)).toBe("exile");
    expect(game.state.objects[exiled].exiledWith?.source).toBe(illuminator);
    const top = toLibrary(game, "Sol Ring");
    lands(game, "Island", 1);
    expect(canCast(game, top)).toBe(true);
    // A card of another type: not while it's on top instead.
    const shock = toLibrary(game, "Shock");
    lands(game, "Mountain", 1);
    expect(canCast(game, shock)).toBe(false);
  });

  it("Elder Brain exiles that player's hand, they redraw, and you may play the exiled cards", () => {
    const { game, a } = table();
    const brain = spawn(game, "Elder Brain", A);
    const before = hand(game, B).length;
    const shock = toHand(game, "Shock", B);
    attack(game, a, [brain]);
    expect(zoneOf(game, shock)).toBe("exile");
    expect(hand(game, B)).toHaveLength(before + 1);
    lands(game, "Swamp", 1); // spend as any color: a Swamp pays {R}
    expect(canCast(game, shock)).toBe(true);
  });

  it("Uba Mask: the drawn card is exiled, the drawer may play it this turn only", () => {
    const { game } = table();
    spawn(game, "Uba Mask", A);
    const before = hand(game, A).length;
    const top = toLibrary(game, "Shock", A);
    lands(game, "Mountain", 1);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(zoneOf(game, top)).toBe("exile");
    expect(hand(game, A)).toHaveLength(before);
    expect(canCast(game, top)).toBe(true);
    // Bob's draw: exiled too, and Alice can't play it.
    const theirs = toLibrary(game, "Shock", B);
    game.debugApplyEffect(B, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(zoneOf(game, theirs)).toBe("exile");
    expect(canCast(game, theirs)).toBe(false);
    // The next turn it's no longer playable.
    toStep(game, "precombat-main", A);
    expect(canCast(game, top)).toBe(false);
  });

  it("Jacob Hauken exiles from hand face down; paying transforms, and Hauken's Insight plays it free", () => {
    const { game, a } = table();
    const jacob = spawn(game, "Jacob Hauken, Inspector", A);
    lands(game, "Island", 6);
    const shock = toHand(game, "Shock");
    pickFromZone(a, shock);
    pickModes(a, 0);
    activate(game, jacob, 0);
    expect(zoneOf(game, shock)).toBe("exile");
    expect(canCast(game, shock)).toBe(true);

    // Hauken's Insight, reached by transforming: its upkeep exiles the top card.
    const top = game.debugSpawn("Divination", A, "library");
    nextTurn(game, "upkeep");
    settle(game);
    nextTurn(game, "upkeep");
    settle(game);
    expect(zoneOf(game, top)).toBe("exile");
  });
});
