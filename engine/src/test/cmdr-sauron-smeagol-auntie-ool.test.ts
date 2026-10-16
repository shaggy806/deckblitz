/**
 * Three top-500 commanders whose blockers have all been built since they
 * were triaged: Sauron, the Dark Lord (#9), Sméagol, Helpful Guide (#369)
 * and Auntie Ool, Cursewretch (#88).
 */
import { describe, expect, it } from "vitest";

import { counters, graveyard, hand, life, named, pickFromZone, pickModes, spawn, table, toLibrary, toStep, zone } from "./harness.js";
import { A, B, attack, cast, controller, destroy, lands, settle, toHand } from "./harness.js";

describe("Sauron, the Dark Lord", () => {
  it("whenever an opponent casts a spell, amass Orcs 1", () => {
    const { game } = table();
    spawn(game, "Sauron, the Dark Lord");
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, bolt, { player: B, targets: [{ kind: "player", player: A }] });
    const armies = named(game, "Army Token", A);
    expect(armies).toHaveLength(1);
    expect(counters(game, armies[0])).toBe(1);
  });

  it("an Army's combat damage tempts you; tempted, you may discard your hand to draw four", () => {
    const { game, a } = table();
    spawn(game, "Sauron, the Dark Lord");
    game.debugApplyEffect(A, { kind: "amass", amount: 2, creatureType: "Orc" });
    const army = named(game, "Army Token", A)[0];
    game.state.objects[army].summoningSick = false;
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Wastes");
    const before = hand(game).length;
    pickModes(a, 0);
    attack(game, a, [army]);
    expect(life(game, B)).toBe(18);
    expect(game.state.players[A].ringTemptations).toBe(1);
    expect(hand(game)).toHaveLength(4);
    expect(graveyard(game).length).toBeGreaterThanOrEqual(before);
  });

  it("declining keeps the hand", () => {
    const { game, a } = table();
    spawn(game, "Sauron, the Dark Lord");
    game.debugApplyEffect(A, { kind: "amass", amount: 2, creatureType: "Orc" });
    const army = named(game, "Army Token", A)[0];
    game.state.objects[army].summoningSick = false;
    const before = hand(game).length;
    pickModes(a);
    attack(game, a, [army]);
    expect(game.state.players[A].ringTemptations).toBe(1);
    expect(hand(game)).toHaveLength(before);
  });
});

describe("Sméagol, Helpful Guide", () => {
  it("a creature died under your control: the Ring tempts you, and the opponent's next land is yours, tapped", () => {
    const { game } = table();
    spawn(game, "Sméagol, Helpful Guide");
    destroy(game, spawn(game, "Grizzly Bears"));
    const forest = toLibrary(game, "Forest", B);
    const giant = toLibrary(game, "Hill Giant", B);
    const bears = toLibrary(game, "Grizzly Bears", B);
    toStep(game, "end");
    settle(game);
    expect(game.state.players[A].ringTemptations).toBe(1);
    expect(zone(game, forest)).toBe("battlefield");
    expect(controller(game, forest)).toBe(A);
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[bears].owner).toBe(B);
  });

  it("no creature of yours died: no temptation", () => {
    const { game } = table();
    spawn(game, "Sméagol, Helpful Guide");
    destroy(game, spawn(game, "Grizzly Bears", B));
    toStep(game, "end");
    settle(game);
    expect(game.state.players[A].ringTemptations ?? 0).toBe(0);
  });
});

describe("Auntie Ool, Cursewretch", () => {
  it("-1/-1 counters on your creature draw a card; on another player's, that player loses 1 life", () => {
    const { game } = table();
    spawn(game, "Auntie Ool, Cursewretch");
    const mine = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Hill Giant", B);
    const before = hand(game).length;
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "-1/-1", amount: 2 }, [
      { kind: "object", object: mine },
    ]);
    settle(game);
    expect(hand(game)).toHaveLength(before + 1);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 }, [
      { kind: "object", object: theirs },
    ]);
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(hand(game)).toHaveLength(before + 1);
  });

  it("a creature the counters kill is read as it last was: its controller loses the life", () => {
    const { game } = table();
    spawn(game, "Auntie Ool, Cursewretch");
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "-1/-1", amount: 2 }, [
      { kind: "object", object: bears },
    ]);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
  });

  it("once per creature: counters put on two creatures at once trigger twice", () => {
    const { game } = table();
    spawn(game, "Auntie Ool, Cursewretch");
    spawn(game, "Hill Giant", B);
    spawn(game, "Hill Giant", B);
    game.debugApplyEffect(A, {
      kind: "add-counter-all",
      filter: { type: "creature", controlledBy: "opponent" },
      counter: "-1/-1",
      amount: 1,
    });
    settle(game);
    expect(life(game, B)).toBe(18);
  });
});

describe("Ezio Auditore da Firenze", () => {
  const freerunningOffers = (game: ReturnType<typeof table>["game"], card: string) =>
    game.legalActions(A).filter((l) => l.kind === "cast-spell" && l.via === "freerunning" && l.card === card);

  it("Assassin spells you cast have freerunning {B}{B}, once an Assassin dealt combat damage", () => {
    const { game, a } = table();
    const ezio = spawn(game, "Ezio Auditore da Firenze");
    lands(game, "Swamp", 2);
    const ripper = toHand(game, "Boilerbilges Ripper");
    const azusa = toHand(game, "Azusa, Lost but Seeking");
    expect(freerunningOffers(game, ripper)).toHaveLength(0);
    attack(game, a, [ezio]);
    expect(freerunningOffers(game, ripper).length).toBeGreaterThan(0);
    expect(freerunningOffers(game, azusa)).toHaveLength(0); // not an Assassin
    cast(game, ripper, { via: "freerunning" });
    expect(zone(game, ripper)).toBe("battlefield");
  });

  it("combat damage to a player at 10 or less life: pay {W}{U}{B}{R}{G} and they lose the game", () => {
    const { game, a } = table({ players: 3 });
    const ezio = spawn(game, "Ezio Auditore da Firenze");
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, 1);
    game.state.players[B].life = 13;
    pickModes(a, 0);
    attack(game, a, [ezio]);
    expect(game.state.players[B].hasLost).toBe(true);
  });

  it("above 10 life as it resolves, nothing is asked", () => {
    const { game, a } = table({ players: 3 });
    const ezio = spawn(game, "Ezio Auditore da Firenze");
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, 1);
    game.state.players[B].life = 14;
    pickModes(a, 0);
    attack(game, a, [ezio]);
    expect(life(game, B)).toBe(11);
    expect(game.state.players[B].hasLost).toBe(false);
  });
});

describe("Peter Parker // Amazing Spider-Man", () => {
  it("Amazing Spider-Man gives legendary colored spells web-slinging {G}{W}{U}", () => {
    const { game } = table();
    const peter = spawn(game, "Peter Parker");
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [{ kind: "object", object: peter }]);
    spawn(game, "Grizzly Bears", A, { tapped: true });
    for (const land of ["Forest", "Plains", "Island"]) lands(game, land, 1);
    const azusa = toHand(game, "Azusa, Lost but Seeking");
    const bears = toHand(game, "Grizzly Bears");
    const webOffers = (card: string) =>
      game.legalActions(A).filter((l) => l.kind === "cast-spell" && l.via === "web-slinging" && l.card === card);
    expect(webOffers(azusa).length).toBeGreaterThan(0);
    expect(webOffers(bears)).toHaveLength(0); // not legendary
  });

  it("Peter Parker makes a 2/1 Spider with reach as he enters", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Peter Parker"));
    expect(named(game, "2/1 Green Spider Token (Reach)", A)).toHaveLength(1);
  });
});

describe("The Necrobloom", () => {
  it("landfall: a Plant, or a Zombie instead with seven lands of different names", () => {
    const { game } = table();
    spawn(game, "The Necrobloom");
    // Six names, one of them twice: not seven.
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest", "Forest"]) spawn(game, land);
    game.debugSpawn("Wastes", A, "battlefield", { announceEntry: true });
    settle(game);
    expect(named(game, "Plant Token", A)).toHaveLength(1);
    expect(named(game, "Zombie Token", A)).toHaveLength(0);
    game.debugSpawn("Command Tower", A, "battlefield", { announceEntry: true });
    settle(game);
    expect(named(game, "Zombie Token", A)).toHaveLength(1);
    expect(named(game, "Plant Token", A)).toHaveLength(1);
  });

  it("land cards in your graveyard have dredge 2; others don't", () => {
    const { game } = table();
    spawn(game, "The Necrobloom");
    const land = game.debugSpawn("Command Tower", A, "graveyard");
    game.debugSpawn("Grizzly Bears", A, "graveyard");
    const libraryBefore = game.state.zones.perPlayer[A].library.length;
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind === "choose-modes" && awaiting.dredgeFor?.cards).toEqual([land]);
    game.dispatch({ type: "choose-modes", player: A, modes: [1] });
    expect(zone(game, land)).toBe("hand");
    expect(game.state.zones.perPlayer[A].library).toHaveLength(libraryBefore - 2);
  });
});

describe("Norman Osborn // Green Goblin", () => {
  it("Green Goblin: a nonland card discarded this turn has mayhem for its mana cost, {2} less from the graveyard", () => {
    const { game } = table();
    const norman = spawn(game, "Norman Osborn");
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [{ kind: "object", object: norman }]);
    lands(game, "Mountain", 2);
    const giant = toHand(game, "Hill Giant");
    const mayhemOffers = () =>
      game.legalActions(A).filter((l) => l.kind === "cast-spell" && l.via === "mayhem" && l.card === giant);
    expect(mayhemOffers()).toHaveLength(0);
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" });
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(mayhemOffers().length).toBeGreaterThan(0);
    // {3}{R} less {2}: two Mountains pay it.
    cast(game, giant, { via: "mayhem" });
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("a card in the graveyard not discarded this turn has no mayhem", () => {
    const { game } = table();
    const norman = spawn(game, "Norman Osborn");
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [{ kind: "object", object: norman }]);
    lands(game, "Mountain", 4);
    const giant = game.debugSpawn("Hill Giant", A, "graveyard");
    expect(game.legalActions(A).some((l) => l.kind === "cast-spell" && l.card === giant)).toBe(false);
  });
});

describe("Hakbal of the Surging Soul", () => {
  it("at the beginning of combat, each Merfolk you control explores, one at a time in the order chosen", () => {
    const { game, a } = table();
    const hakbal = spawn(game, "Hakbal of the Surging Soul");
    const scout = spawn(game, "Cenote Scout");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Cenote Scout", B);
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Hill Giant");
    let orderAsked: readonly string[] = [];
    a.chooseModesFn = (view) => {
      const awaiting = view.state.awaiting;
      if (awaiting?.kind === "choose-modes" && awaiting.modes.length > 1) {
        orderAsked = awaiting.modes.map((m) => m.text);
        return [1]; // the Scout first
      }
      return [0]; // put each revealed card into the graveyard
    };
    toStep(game, "begin-combat");
    settle(game);
    expect(orderAsked).toEqual(["Hakbal of the Surging Soul explores next", "Cenote Scout explores next"]);
    expect(counters(game, hakbal)).toBe(1);
    expect(counters(game, scout)).toBe(1);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, theirs)).toBe(0);
    // The Scout went first: it revealed the Hill Giant on top.
    expect(graveyard(game).map((id) => game.state.objects[id].cardName)).toEqual(["Hill Giant", "Grizzly Bears"]);
  });

  it("whenever Hakbal attacks: a land from hand onto the battlefield, or, if you don't, draw", () => {
    const { game, a } = table();
    const hakbal = spawn(game, "Hakbal of the Surging Soul");
    const forest = toHand(game, "Forest");
    const handBefore = hand(game).length;
    pickModes(a, 0);
    pickFromZone(a, forest);
    attack(game, a, [hakbal]);
    expect(zone(game, forest)).toBe("battlefield");
    // Less the Forest, plus the land Hakbal's own combat exploration found
    // (the library is Wastes) — and no draw.
    expect(hand(game)).toHaveLength(handBefore - 1 + 1);
  });

  it("declining the land draws a card", () => {
    const { game, a } = table();
    const hakbal = spawn(game, "Hakbal of the Surging Soul");
    toHand(game, "Forest");
    const handBefore = hand(game).length;
    pickModes(a, 0);
    pickFromZone(a);
    attack(game, a, [hakbal]);
    // The explored Wastes, and the draw.
    expect(hand(game)).toHaveLength(handBefore + 2);
  });
});
