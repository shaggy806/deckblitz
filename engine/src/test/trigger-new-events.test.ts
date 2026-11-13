/**
 * Trigger events added to the vocabulary for the triggers-journal lane
 * (2026-11-13): a mill once per card, each one its own trigger.
 */
import { describe, expect, it } from "vitest";
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
  nextTurn,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import { investigate } from "../cards/helpers.js";

describe("mills, per card (Glowing One, Infesting Radroach)", () => {
  it("Glowing One gains 1 life for each nonland card milled, whoever milled", () => {
    const { game } = table({ players: 2, deck: "Wastes" });
    spawn(game, "Glowing One");
    toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Wastes", B);
    toLibrary(game, "Llanowar Elves", B);
    toLibrary(game, "Shock", B);
    const before = life(game, A);
    game.debugApplyEffect(A, { kind: "mill", target: "each-opponent", amount: 4 });
    settle(game);
    expect(life(game, A)).toBe(before + 3);
  });

  it("a mill of lands alone doesn't trigger it", () => {
    const { game } = table({ players: 2, deck: "Wastes" });
    spawn(game, "Glowing One");
    const before = life(game, A);
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 3 });
    settle(game);
    expect(life(game, A)).toBe(before);
  });

  it("Infesting Radroach returns from your graveyard when an opponent mills a nonland card", () => {
    const { game, a } = table({ players: 2, deck: "Wastes" });
    const roach = toGraveyard(game, "Infesting Radroach", A);
    toLibrary(game, "Grizzly Bears", B);
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "mill", target: "each-opponent", amount: 1 });
    settle(game);
    expect(zone(game, roach)).toBe("hand");
    expect(hand(game, A)).toContain(roach);
  });

  it("doesn't trigger on its controller's own mill", () => {
    const { game } = table({ players: 2, deck: "Wastes" });
    const roach = toGraveyard(game, "Infesting Radroach", A);
    toLibrary(game, "Grizzly Bears", A);
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 1 });
    settle(game);
    expect(zone(game, roach)).toBe("graveyard");
  });

  it("sees an opponent's mill made at the same time as its own (the ruling)", () => {
    // Each player mills a card, in turn order: Alice's Bears, then Bob's,
    // then Carol's Radroach — announced once every one of them has milled.
    const { game, c } = table({ players: 3, deck: "Wastes" });
    toLibrary(game, "Grizzly Bears", A);
    toLibrary(game, "Grizzly Bears", B);
    const roach = toLibrary(game, "Infesting Radroach", C);
    pickModes(c, 0);
    game.debugApplyEffect(B, { kind: "mill", target: "each-player", amount: 1 });
    settle(game);
    expect(zone(game, roach)).toBe("hand");
  });
});

describe("investigates (Erdwal Illuminator)", () => {
  const clues = (game: ReturnType<typeof table>["game"]): number => tokensNamed(game, "Clue Token", A);

  it("investigates an additional time the first time each turn, and only then", () => {
    const { game } = table({ players: 2 });
    spawn(game, "Erdwal Illuminator");
    game.debugApplyEffect(A, investigate());
    settle(game);
    expect(clues(game)).toBe(2);
    game.debugApplyEffect(A, investigate());
    settle(game);
    expect(clues(game)).toBe(3);
  });

  it("counts an investigation made before it arrived this turn", () => {
    const { game } = table({ players: 2 });
    game.debugApplyEffect(A, investigate());
    settle(game);
    spawn(game, "Erdwal Illuminator");
    game.debugApplyEffect(A, investigate());
    settle(game);
    expect(clues(game)).toBe(2);
  });

  it("isn't a Clue made without the word, nor an opponent's investigation", () => {
    const { game } = table({ players: 2 });
    spawn(game, "Erdwal Illuminator");
    game.debugApplyEffect(A, { kind: "create-token", token: "Clue Token", count: 1 });
    game.debugApplyEffect(B, investigate());
    settle(game);
    expect(clues(game)).toBe(1);
    expect(tokensNamed(game, "Clue Token", B)).toBe(1);
  });

  it("sees a pool card's investigation (Thraben Inspector)", () => {
    const { game } = table({ players: 2 });
    spawn(game, "Erdwal Illuminator");
    enter(game, "Thraben Inspector");
    settle(game);
    expect(clues(game)).toBe(2);
  });
});

describe("a mana ability resolves (Tyvar the Bellicose)", () => {
  it("puts a counter on a creature whose mana ability made one mana, once each turn", () => {
    const { game } = table({ players: 2 });
    spawn(game, "Tyvar the Bellicose");
    const elves = spawn(game, "Llanowar Elves");
    activate(game, elves);
    settle(game);
    expect(counters(game, elves)).toBe(1);
    game.state.objects[elves].tapped = false;
    activate(game, elves);
    settle(game);
    expect(counters(game, elves)).toBe(1);
  });

  it("the amount is what the ability made (Elvish Archdruid with two Elves)", () => {
    const { game } = table({ players: 2 });
    spawn(game, "Tyvar the Bellicose");
    const druid = spawn(game, "Elvish Archdruid");
    activate(game, druid);
    settle(game);
    expect(counters(game, druid)).toBe(2);
  });

  it("sees a mana ability activated while paying a cost", () => {
    const { game } = table({ players: 2 });
    spawn(game, "Tyvar the Bellicose");
    const elves = spawn(game, "Llanowar Elves");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(counters(game, elves)).toBe(1);
  });

  it("not a land's, and not an opponent's creature", () => {
    const { game } = table({ players: 2 });
    spawn(game, "Tyvar the Bellicose");
    const theirs = spawn(game, "Llanowar Elves", B);
    const [forest] = lands(game, "Forest", 1);
    activate(game, forest);
    settle(game);
    expect(counters(game, forest)).toBe(0);
    expect(counters(game, theirs)).toBe(0);
  });

  it("Elves you control that attack gain deathtouch", () => {
    const { game, a } = table({ players: 2 });
    spawn(game, "Tyvar the Bellicose");
    const elves = spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [elves, bears].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    expect(keywords(game, elves).has("deathtouch")).toBe(true);
    expect(keywords(game, bears).has("deathtouch")).toBe(false);
  });
});

describe("untaps during your untap step (The Ninth Doctor)", () => {
  it("gives you an additional upkeep after the upkeep its trigger resolves in", () => {
    const { game } = table({ players: 2 });
    spawn(game, "The Ninth Doctor", A, { tapped: true });
    spawn(game, "Phyrexian Arena");
    toStep(game, "draw", A);
    // Two upkeeps, two Arena triggers.
    expect(life(game, A)).toBe(18);
  });

  it("not when it was already untapped", () => {
    const { game } = table({ players: 2 });
    spawn(game, "The Ninth Doctor");
    spawn(game, "Phyrexian Arena");
    toStep(game, "draw", A);
    expect(life(game, A)).toBe(19);
  });

  it("not untapping in another player's untap step (Seedborn Muse)", () => {
    const { game } = table({ players: 2 });
    const doctor = spawn(game, "The Ninth Doctor", A, { tapped: true });
    spawn(game, "Seedborn Muse");
    toStep(game, "draw", B);
    expect(game.state.objects[doctor].tapped).toBe(false);
    expect(game.state.turn.upkeepSteps ?? 1).toBe(1);
  });
});

describe("a Saga's final chapter ability triggers (Historian's Boon)", () => {
  const lore = (game: ReturnType<typeof table>["game"], saga: string, before: number): void => {
    const id = spawn(game, saga);
    game.state.objects[id].counters.lore = before;
    game.debugApplyEffect(A, { kind: "add-counter", target: "source", counter: "lore", amount: 1 }, [], { source: id });
    settle(game);
  };

  it("makes a 4/4 Angel as the final chapter triggers", () => {
    const { game } = table({ players: 2 });
    spawn(game, "Historian's Boon");
    lore(game, "History of Benalia", 2);
    expect(tokensNamed(game, "4/4 Vigilant Angel Token", A)).toBe(1);
  });

  it("not for an earlier chapter, nor an opponent's Saga", () => {
    const { game } = table({ players: 2 });
    spawn(game, "Historian's Boon");
    lore(game, "History of Benalia", 1);
    expect(tokensNamed(game, "4/4 Vigilant Angel Token", A)).toBe(0);
    const theirs = spawn(game, "History of Benalia", B);
    game.state.objects[theirs].counters.lore = 2;
    game.debugApplyEffect(B, { kind: "add-counter", target: "source", counter: "lore", amount: 1 }, [], { source: theirs });
    settle(game);
    expect(tokensNamed(game, "4/4 Vigilant Angel Token", A)).toBe(0);
  });

  it("makes a Soldier as it or another nontoken enchantment of yours enters", () => {
    const { game } = table({ players: 2 });
    enter(game, "Historian's Boon");
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
    enter(game, "Phyrexian Arena");
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
    enter(game, "Phyrexian Arena", B);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
  });
});

describe("phases out (The War Doctor, Teferi's Imp)", () => {
  type G = ReturnType<typeof table>["game"];
  const phaseOut = (game: G, ids: readonly string[]): void => {
    game.debugApplyEffect(
      A,
      { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "phase-out", target: 0 } },
      ids.map((id) => ref(id as never)),
    );
    settle(game);
  };

  it("The War Doctor gets a time counter as one or more other permanents phase out, once", () => {
    const { game } = table({ players: 2 });
    const doctor = spawn(game, "The War Doctor");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    phaseOut(game, [one, two]);
    expect(counters(game, doctor, "time")).toBe(1);
  });

  it("phasing out with another, it sees it go (rule 603.10b) but can't be given the counter (702.26b)", () => {
    const { game } = table({ players: 2 });
    const doctor = spawn(game, "The War Doctor");
    const bears = spawn(game, "Grizzly Bears", B);
    phaseOut(game, [doctor, bears]);
    expect(game.state.eventLog.some((e) => e.type === "ability-triggered" && e.source === doctor)).toBe(true);
    expect(counters(game, doctor, "time")).toBe(0);
  });

  it("not as it phases out alone", () => {
    const { game } = table({ players: 2 });
    const doctor = spawn(game, "The War Doctor");
    phaseOut(game, [doctor]);
    expect(counters(game, doctor, "time")).toBe(0);
  });

  it("and as one or more other cards are put into exile, from anywhere", () => {
    const { game } = table({ players: 2 });
    const doctor = spawn(game, "The War Doctor");
    const card = toGraveyard(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(card)]);
    settle(game);
    expect(counters(game, doctor, "time")).toBe(1);
  });

  it("attacking deals its time counters' worth, exiling a creature that would die this turn", () => {
    const { game, a } = table({ players: 2 });
    const doctor = spawn(game, "The War Doctor");
    game.state.objects[doctor].counters.time = 2;
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    attack(game, a, [doctor]);
    expect(zone(game, bears)).toBe("exile");
  });

  it("Ertai's Familiar mills three as it phases out, or as it leaves, and {U} keeps it from phasing out", () => {
    const { game } = table({ players: 2 });
    const familiar = spawn(game, "Ertai's Familiar");
    phaseOut(game, [familiar]);
    expect(graveyard(game, A).length).toBe(3);
    const other = spawn(game, "Ertai's Familiar");
    destroy(game, other);
    settle(game);
    expect(graveyard(game, A).length).toBe(7);
    const held = spawn(game, "Ertai's Familiar");
    lands(game, "Island", 1);
    activate(game, held);
    phaseOut(game, [held]);
    expect(zone(game, held)).toBe("battlefield");
  });

  it("Teferi's Imp discards as it phases out, though phased out by then (rule 603.10b), and draws as it phases in", () => {
    const { game } = table({ players: 2 });
    const imp = spawn(game, "Teferi's Imp");
    const held = hand(game, A).length;
    phaseOut(game, [imp]);
    expect(hand(game, A).length).toBe(held - 1);
    expect(game.state.eventLog.some((e) => e.type === "cards-discarded" && e.player === A)).toBe(true);
    const before = hand(game, A).length;
    nextTurn(game, "upkeep");
    toStep(game, "precombat-main", A);
    // It phased in at Alice's untap step and drew; her draw step drew one too.
    expect(zone(game, imp)).toBe("battlefield");
    expect(hand(game, A).length).toBeGreaterThanOrEqual(before + 2);
  });
});

describe("pays life (Font of Agonies)", () => {
  it("counts an ability's life cost", () => {
    const { game } = table({ players: 2 });
    const font = spawn(game, "Font of Agonies");
    lands(game, "Swamp", 1);
    const greed = spawn(game, "Greed");
    activate(game, greed);
    expect(counters(game, font, "blood")).toBe(2);
  });

  it("counts an additional cost's X life, that many", () => {
    const { game } = table({ players: 2 });
    const font = spawn(game, "Font of Agonies");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Toxic Deluge"), { x: 3 });
    expect(counters(game, font, "blood")).toBe(3);
  });

  it("counts an \"unless you pay N life\" paid, and not a loss of life", () => {
    const { game, a } = table({ players: 2 });
    const font = spawn(game, "Font of Agonies");
    game.debugApplyEffect(A, { kind: "lose-life", amount: 3, who: "you" });
    settle(game);
    expect(counters(game, font, "blood")).toBe(0);
    pickModes(a, 0);
    game.debugApplyEffect(A, {
      kind: "unless",
      chooser: "you",
      options: [{ payLife: 2, text: "Pay 2 life" }],
      otherwise: { kind: "draw", amount: 1 },
    });
    settle(game);
    expect(counters(game, font, "blood")).toBe(2);
  });

  it("removes four blood counters to destroy a creature", () => {
    const { game } = table({ players: 2 });
    const font = spawn(game, "Font of Agonies");
    game.debugApplyEffect(A, { kind: "add-counter", target: "source", counter: "blood", amount: 4 }, [], { source: font });
    lands(game, "Swamp", 2);
    const bear = spawn(game, "Grizzly Bears", B);
    activate(game, font, 0, { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("graveyard");
    expect(counters(game, font, "blood")).toBe(0);
  });
});
