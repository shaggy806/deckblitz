import { describe, expect, it } from "vitest";


import { A, B, C, activate, attack, cast, controller, counters, enter, graveyard, hand, keywords, lands, life, loyalty, named, pickFromZone, pickModes, pickPermanents, pickTargets, pt, ref, settle, spawn, subtypes, table, toExile, toGraveyard, toHand, toLibrary, toStep, tokensNamed, types, zone } from "./harness.js";

describe("B294 group C", () => {
  it("Ojer Kaslem: reveal that many, a creature and a land onto the battlefield, the rest on the bottom; dying, it returns transformed", () => {
    const t = table();
    const { game, a } = t;
    const ojer = spawn(game, "Ojer Kaslem, Deepest Growth");
    toLibrary(game, "Island");
    toLibrary(game, "Island");
    toLibrary(game, "Island");
    const bears = toLibrary(game, "Grizzly Bears");
    const land = toLibrary(game, "Forest");
    pickFromZone(a, bears, land);
    attack(game, a, [ojer]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, land)).toBe("battlefield");
    expect(life(game, B)).toBe(14);
    expect(zone(game, ojer)).toBe("battlefield");
    // Dies: back tapped as the Temple.
    game.debugMove(ojer, "graveyard");
    settle(game);
    expect(zone(game, ojer)).toBe("battlefield");
    expect(types(game, ojer)).toContain("land");
    expect(game.state.objects[ojer].tapped).toBe(true);
  });

  it("Winding Constrictor: +1 on artifacts, creatures and players' counters, not enchantments or opponents' creatures", () => {
    const { game, a } = table();
    spawn(game, "Winding Constrictor");
    const bear = spawn(game, "Grizzly Bears");
    const theirBear = spawn(game, "Grizzly Bears", B);
    const rhox = spawn(game, "Sol Ring");
    const ench = spawn(game, "Honor of the Pure");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bear)]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(rhox)]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(ench)]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(theirBear)]);
    game.debugApplyEffect(A, { kind: "get-energy", amount: 2 });
    expect(counters(game, bear)).toBe(2);
    expect(counters(game, rhox)).toBe(2);
    expect(counters(game, ench)).toBe(1);
    expect(counters(game, theirBear)).toBe(1);
    expect(game.state.players[A].energy).toBe(3);
    void a;
  });

  it("Emeria Shepherd: a Plains may put it onto the battlefield instead; a Mountain only offers the hand", () => {
    const { game, a } = table();
    spawn(game, "Emeria Shepherd");
    const card = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, card);
    pickModes(a, 0);
    enter(game, "Plains");
    expect(zone(game, card)).toBe("battlefield");
    const other = toGraveyard(game, "Hill Giant");
    pickTargets(a, other);
    pickModes(a, 0);
    enter(game, "Mountain");
    expect(zone(game, other)).toBe("hand");
  });

  it("Descendants' Path: a matching creature may be cast free; declined, or no shared type, it goes to the bottom", () => {
    const { game, a } = table();
    spawn(game, "Descendants' Path");
    spawn(game, "Grizzly Bears");
    const yes = toLibrary(game, "Runeclaw Bear");
    let asked = 0;
    a.chooseCastNowFn = (_view, offer) => {
      asked += 1;
      const way = offer.casts.find((c) => c.card === yes);
      return way === undefined ? null : { type: "cast-spell", player: A, card: yes, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    toStep(game, "precombat-main");
    // The first upkeep past is next turn's.
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "draw");
    settle(game);
    expect(asked).toBe(1);
    expect(zone(game, yes)).toBe("battlefield");
    const no = toLibrary(game, "Hill Giant");
    game.advanceUntil((s) => s.turn.number === 5 && s.turn.step === "draw");
    settle(game);
    expect(asked).toBe(1);
    expect(zone(game, no)).toBe("library");
    const lib = game.state.zones.perPlayer[A].library;
    expect(lib[0]).toBe(no);
  });

  it("Ancient Cellarspawn: spells of its types cost {1} less, and the opponent loses the difference", () => {
    const { game, a } = table();
    spawn(game, "Ancient Cellarspawn");
    lands(game, "Swamp", 4);
    pickTargets(a, B);
    cast(game, toHand(game, "Bloodgift Demon"));
    expect(life(game, B)).toBe(19);
  });

  it("Domri: after the +1, creature spells can't be countered this turn", () => {
    const { game, a, b } = table();
    const domri = spawn(game, "Domri, Anarch of Bolas");
    lands(game, "Forest", 2);
    lands(game, "Island", 4, B);
    pickModes(a, 0);
    loyalty(game, domri, 1);
    expect(counters(game, domri, "loyalty")).toBe(4);
    const bears = toHand(game, "Grizzly Bears");
    const counter = toHand(game, "Counterspell", B);
    cast(game, bears, { settle: false });
    game.advanceUntil((s) => s.priority.holder === B && s.zones.shared.stack.length === 1);
    cast(game, counter, { player: B, targets: [ref(bears)], settle: false });
    settle(game);
    void b;
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Barrowgoyf: milled that many, may take a creature card from among them", () => {
    const { game, a } = table();
    const goyf = spawn(game, "Barrowgoyf");
    toGraveyard(game, "Grizzly Bears");
    toLibrary(game, "Island");
    const bear = toLibrary(game, "Runeclaw Bear");
    pickModes(a, 0);
    pickFromZone(a, bear);
    attack(game, a, [goyf]);
    expect(zone(game, bear)).toBe("hand");
  });

  it("Bandit's Talent: level 3 draws one more per opponent with one or fewer cards in hand", () => {
    const { game } = table({ players: 3 });
    const talent = spawn(game, "Bandit's Talent");
    game.state.objects[talent].classLevel = 3;
    game.state.zones.perPlayer[B].hand = [];
    game.advanceUntil((s) => s.turn.number === 4 && s.turn.step === "upkeep" && s.priority.holder === A);
    settle(game);
    const before = hand(game).length;
    game.advanceUntil((s) => s.turn.number === 4 && s.turn.step === "precombat-main" && s.priority.holder === A);
    settle(game);
    // The normal draw, and one more for bob (one card in hand); carol has plenty.
    expect(hand(game).length).toBe(before + 2);
  });

  it("Balor: attacking, the chosen mode deals damage equal to that opponent's hand size", () => {
    const { game, a } = table();
    const balor = spawn(game, "Balor");
    toHand(game, "Island", B);
    const handSize = hand(game, B).length;
    pickModes(a, 2);
    pickTargets(a, B);
    const lifeBefore = life(game, B);
    a.declareAttackersFn = () => [{ attacker: balor, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length === 0);
    settle(game);
    expect(life(game, B)).toBe(lifeBefore - handSize);
  });

  it("Martial Impetus: each other creature attacking your opponents gets +1/+1, not the enchanted one", () => {
    const t = table({ players: 3 });
    const { game, a } = t;
    const enchanted = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Martial Impetus"), { targets: [ref(enchanted)] });
    const other = spawn(game, "Hill Giant", B);
    expect(pt(game, enchanted)).toEqual({ power: 3, toughness: 3 });
    // Bob attacks carol with both: bob's are not alice's opponents' attackers — alice is the Aura's controller.
    toStep(game, "precombat-main", B);
    t.b.declareAttackersFn = () => [
      { attacker: enchanted, defender: C },
      { attacker: other, defender: C },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" || s.turn.step === "postcombat-main");
    settle(game);
    expect(pt(game, other)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, enchanted)).toEqual({ power: 3, toughness: 3 });
    void a;
  });

  it("Phyresis Outbreak: each opponent gets poison, each of their creatures -1/-1 per its controller's poison", () => {
    const { game } = table({ players: 3 });
    const bb = spawn(game, "Grizzly Bears", B);
    const cc = spawn(game, "Hill Giant", C);
    game.debugApplyEffect(A, { kind: "add-player-counters", counter: "poison", amount: 1, who: { target: 0 } }, [ref(C)]);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Phyresis Outbreak"));
    expect(game.state.players[B].counters?.poison).toBe(1);
    expect(pt(game, bb)).toEqual({ power: 1, toughness: 1 });
    expect(game.state.players[C].counters?.poison).toBe(2);
    expect(pt(game, cc)).toEqual({ power: 1, toughness: 1 });
  });

  it("Prisoner's Dilemma: all silence 4 each; all snitch 8 each; mixed 12 to each silence", () => {
    const run = (bAnswer: number, cAnswer: number): readonly number[] => {
      const t = table({ players: 3 });
      lands(t.game, "Mountain", 5);
      t.b.chooseModesFn = () => [bAnswer];
      t.c.chooseModesFn = () => [cAnswer];
      cast(t.game, toHand(t.game, "Prisoner's Dilemma"));
      return [life(t.game, B), life(t.game, C)];
    };
    expect(run(0, 0)).toEqual([16, 16]);
    expect(run(1, 1)).toEqual([12, 12]);
    expect(run(0, 1)).toEqual([8, 20]);
    expect(run(1, 0)).toEqual([20, 8]);
  });

  it("Rise and Shine: overloaded it animates and counters every noncreature artifact you control", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    const mox = spawn(game, "Mox Opal");
    const myr = spawn(game, "Alloy Myr");
    lands(game, "Island", 6);
    void a;
    cast(game, toHand(game, "Rise and Shine"), { overload: true });
    expect(pt(game, ring)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, mox)).toEqual({ power: 4, toughness: 4 });
    expect(counters(game, myr)).toBe(0);
  });

  it("Determined Iteration: the populated token gains haste and is sacrificed at the end step", () => {
    const { game, a } = table();
    spawn(game, "Determined Iteration");
    const token = game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 });
    void token;
    a.declareAttackersFn = () => [];
    game.advanceUntil((s) => s.turn.step === "begin-combat");
    settle(game);
    const tokens = named(game, "Soldier Token", A);
    expect(tokens.length).toBe(2);
    const hasted = tokens.filter((id) => keywords(game, id).has("haste"));
    expect(hasted.length).toBe(1);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Soldier Token", A).length).toBe(1);
  });

  it("Realmbreaker: mills three, puts a land from their graveyard under you tapped; it exiles if it would leave", () => {
    const { game, a } = table();
    const tree = spawn(game, "Realmbreaker, the Invasion Tree");
    lands(game, "Wastes", 2);
    const forest = toLibrary(game, "Forest", B);
    pickFromZone(a, forest);
    activate(game, tree, 0, { targets: [ref(B)] });
    expect(zone(game, forest)).toBe("battlefield");
    expect(controller(game, forest)).toBe(A);
    expect(game.state.objects[forest].tapped).toBe(true);
    game.debugMove(forest, "hand");
    settle(game);
    expect(zone(game, forest)).toBe("exile");
  });

  it("Ghoulish Impetus: returns at the next end step, not if exiled from the graveyard", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    const aura = toHand(game, "Ghoulish Impetus");
    cast(game, aura, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    const next = spawn(game, "Hill Giant", B);
    a.chooseEnchantFn = () => next;
    b.chooseEnchantFn = () => next;
    game.debugMove(bears, "graveyard");
    settle(game);
    expect(zone(game, aura)).toBe("graveyard");
    toStep(game, "end");
    settle(game);
    expect(zone(game, aura)).toBe("battlefield");
  });

  it("Shadow of Mortality: X less, X the difference below your starting life total", () => {
    const { game } = table();
    game.state.players[A].life = 12;
    lands(game, "Swamp", 8);
    const shadow = toHand(game, "Shadow of Mortality");
    cast(game, shadow);
    expect(zone(game, shadow)).toBe("battlefield");
  });

  it("Doors of Durin: a revealed creature enters attacking; an Elf has hexproof until your next turn", () => {
    const { game, a } = table();
    spawn(game, "Doors of Durin");
    const bear = spawn(game, "Grizzly Bears");
    const elf = toLibrary(game, "Llanowar Elves");
    pickModes(a, 0);
    a.chooseScryFn = () => [];
    attack(game, a, [bear]);
    expect(zone(game, elf)).toBe("battlefield");
    expect(keywords(game, elf).has("hexproof")).toBe(true);
    expect(keywords(game, elf).has("trample")).toBe(false);
  });

  it("Generous Patron: draws for counters you put on another's creature, not your own or by others", () => {
    const { game, a } = table();
    spawn(game, "Generous Patron");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(theirs)]);
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(mine)]);
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    void a;
  });

  it("Generous Patron: one draw when proliferate adds two kinds of counters to one creature", () => {
    const { game, a } = table();
    spawn(game, "Generous Patron");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(theirs)]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "charge", amount: 1 }, [ref(theirs)]);
    settle(game);
    const before = hand(game).length;
    a.chooseProliferateFn = (_view, eligible) => [...eligible];
    game.debugApplyEffect(A, { kind: "proliferate" });
    settle(game);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Leyline of Hope: gain life plus 1; at 27+ creatures get +2/+2", () => {
    const { game } = table();
    spawn(game, "Leyline of Hope");
    const bear = spawn(game, "Grizzly Bears");
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
    game.debugApplyEffect(A, { kind: "gain-life", amount: 6 });
    expect(life(game)).toBe(27);
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
  });

  it("Turntimber Symbiosis: three +1/+1 counters only on mana value 3 or less", () => {
    const { game, a } = table();
    lands(game, "Forest", 7);
    const mv4 = toLibrary(game, "Hill Giant");
    const mv2 = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, mv2);
    cast(game, toHand(game, "Turntimber Symbiosis"));
    expect(zone(game, mv2)).toBe("battlefield");
    expect(counters(game, mv2)).toBe(3);
    expect(zone(game, mv4)).toBe("library");
    const t2 = table();
    lands(t2.game, "Forest", 7);
    const big = toLibrary(t2.game, "Hill Giant");
    pickFromZone(t2.a, big);
    cast(t2.game, toHand(t2.game, "Turntimber Symbiosis"));
    expect(zone(t2.game, big)).toBe("battlefield");
    expect(counters(t2.game, big)).toBe(0);
  });

  it("Vivien: -2 exiles one face down; castable if a creature, not otherwise", () => {
    const { game, a } = table();
    const vivien = spawn(game, "Vivien, Champion of the Wilds");
    const bear = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Island");
    toLibrary(game, "Island");
    pickFromZone(a, bear);
    loyalty(game, vivien, -2);
    expect(zone(game, bear)).toBe("exile");
    lands(game, "Forest", 2);
    cast(game, bear, { via: "impulse" });
    expect(zone(game, bear)).toBe("battlefield");
  });

  it("Stensian Sanguinist: the targeted attacker dealing combat damage prepares it", () => {
    const { game, a } = table();
    const sang = spawn(game, "Stensian Sanguinist");
    const attacker = spawn(game, "Grizzly Bears");
    pickTargets(a, attacker);
    attack(game, a, [attacker]);
    expect(game.state.objects[sang].prepared).toBeTruthy();
  });

  it("Summon: Good King Mog XII: chapter II makes a this-turn cast trigger copying a chosen non-Saga token", () => {
    const { game, a } = table();
    const mog = spawn(game, "Summon: Good King Mog XII");
    game.state.objects[mog].counters.lore = 1;
    game.debugApplyEffect(A, { kind: "create-token", token: "Moogle Token", count: 1 });
    const token = named(game, "Moogle Token", A)[0];
    pickPermanents(a, token);
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main");
    settle(game);
    expect(game.state.objects[mog]?.counters.lore).toBe(2);
    lands(game, "Island", 2);
    const before = tokensNamed(game, "Moogle Token", A);
    cast(game, toHand(game, "Opt"));
    expect(tokensNamed(game, "Moogle Token", A)).toBe(before + 1);
  });

  it("Orvar: a spell targeting another permanent you control copies it; targeting only an opponent's doesn't", () => {
    const { game, a } = table();
    spawn(game, "Orvar, the All-Form");
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    pickPermanents(a, bear);
    cast(game, toHand(game, "Vines of Vastwood"), { targets: [ref(bear)] });
    expect(named(game, "Grizzly Bears", A).length).toBe(2);
    const theirs = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Vines of Vastwood"), { targets: [ref(theirs)] });
    expect(named(game, "Hill Giant", A).length).toBe(0);
  });

  it("Twilight Diviner: a creature from a graveyard is copied; one cast from the hand is not", () => {
    const { game, a } = table();
    spawn(game, "Twilight Diviner");
    const corpse = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    lands(game, "Mountain", 4);
    pickTargets(a, corpse);
    cast(game, toHand(game, "Zombify"), { targets: [ref(corpse)] });
    expect(named(game, "Grizzly Bears", A).length).toBe(2);
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(1);
    const fromHand = toHand(game, "Hill Giant");
    cast(game, fromHand);
    expect(tokensNamed(game, "Hill Giant", A)).toBe(0);
  });

  it("Descendants' Fury: sacrificing one reveals until a creature sharing a type with it", () => {
    const { game, a } = table();
    spawn(game, "Descendants' Fury");
    const bear = spawn(game, "Grizzly Bears");
    const wrong = toLibrary(game, "Hill Giant");
    void wrong;
    const found = toLibrary(game, "Runeclaw Bear");
    pickPermanents(a, bear);
    attack(game, a, [bear]);
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, found)).toBe("battlefield");
  });

  it("Oriq Loremage: an instant found adds a counter, even under Rest in Peace; a creature found doesn't", () => {
    const { game, a } = table();
    const oriq = spawn(game, "Oriq Loremage");
    spawn(game, "Rest in Peace");
    const opt = toLibrary(game, "Opt");
    pickFromZone(a, opt);
    activate(game, oriq);
    expect(counters(game, oriq)).toBe(1);
    expect(zone(game, opt)).toBe("exile");
    const t2 = table();
    const oriq2 = spawn(t2.game, "Oriq Loremage");
    const bear = toLibrary(t2.game, "Grizzly Bears");
    pickFromZone(t2.a, bear);
    activate(t2.game, oriq2);
    expect(counters(t2.game, oriq2)).toBe(0);
  });

  it("Hazel of the Rootbloom: taps X tokens for X mana; a Squirrel token is copied twice at end of turn", () => {
    const { game, a } = table();
    const hazel = spawn(game, "Hazel of the Rootbloom");
    game.debugApplyEffect(A, { kind: "create-token", token: "Squirrel Token", count: 2 });
    const squirrels = named(game, "Squirrel Token", A);
    pickTargets(a, squirrels[0]);
    const before = tokensNamed(game, "Squirrel Token", A);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(before + 2);
    void hazel;
  });

  it("Hazel of the Rootbloom: taps the X chosen tokens for X mana", () => {
    const { game, a } = table();
    const hazel = spawn(game, "Hazel of the Rootbloom");
    game.debugApplyEffect(A, { kind: "create-token", token: "Squirrel Token", count: 1 });
    game.debugApplyEffect(A, { kind: "create-token", token: "Goblin Token", count: 1 });
    const squirrel = named(game, "Squirrel Token", A)[0];
    const goblin = named(game, "Goblin Token", A)[0];
    void a;
    game.dispatch({ type: "activate-ability", player: A, source: hazel, abilityIndex: 0, targets: [], xValue: 2, tap: [squirrel, goblin] });
    settle(game);
    expect(game.state.objects[squirrel].tapped).toBe(true);
    expect(game.state.objects[goblin].tapped).toBe(true);
    expect(life(game)).toBe(18);
    expect(game.state.players[A].manaPool.length).toBe(2);
  });

  it("Satoru: draws for a creature put in or cast for no mana, not one cast with mana", () => {
    const { game } = table();
    spawn(game, "Satoru, the Infiltrator");
    const before = hand(game).length;
    lands(game, "Forest", 2);
    enter(game, "Grizzly Bears");
    expect(hand(game).length).toBe(before + 1);
    cast(game, toHand(game, "Grizzly Bears"));
    settle(game);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Kozilek: each target player manifests two from hand, you draw that many", () => {
    const { game, a, b } = table();
    lands(game, "Wastes", 9);
    toHand(game, "Island", B);
    toHand(game, "Island", B);
    const before = hand(game, A).length;
    pickTargets(a, B, null);
    pickFromZone(b, ...hand(game, B).slice(0, 2));
    cast(game, toHand(game, "Kozilek, the Broken Reality"));
    expect(hand(game, A).length).toBe(before + 2);
    void graveyard;
    void subtypes;
    void toExile;
  });

  it("Virtue of Strength and Scion of Draco: basic lands triple; domain discounts by 2 per type", () => {
    const { game } = table();
    spawn(game, "Virtue of Strength");
    const forest = spawn(game, "Forest");
    activate(game, forest, 0, { settle: false });
    expect(game.state.players[A].manaPool.filter((u) => u.type === "G").length).toBe(3);
    const t2 = table();
    lands(t2.game, "Island", 2);
    lands(t2.game, "Forest", 2);
    lands(t2.game, "Plains", 2);
    lands(t2.game, "Mountain", 2);
    const scion = toHand(t2.game, "Scion of Draco");
    cast(t2.game, scion);
    expect(zone(t2.game, scion)).toBe("battlefield");
  });
});
