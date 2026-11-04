/**
 * "Creatures you control can boast twice during each of your turns rather than
 * once" (Birgi, God of Storytelling, rule 702.142): the static's
 * `boastsEachOfYourTurns`. Beside it, the rest of Birgi's text and its back
 * face's, Harnfel, Horn of Bounty.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import { poolCounts } from "../mana.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  lands,
  nextTurn,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";

const boast = (game: Game, id: ObjectId, player = A) =>
  game.legalActions(player).filter((a) => a.kind === "activate-ability" && a.source === id);

/** A's Dragonkin Berserker (Boast — {4}{R}: a 5/5 Dragon) having attacked, with `n` Mountains. */
function attacked(n: number, others: readonly string[]) {
  const t = table();
  const { game, a } = t;
  const berserker = spawn(game, "Dragonkin Berserker");
  for (const other of others) spawn(game, other);
  lands(game, "Mountain", n);
  attack(game, a, [berserker]);
  return { ...t, berserker };
}

describe("Birgi: can boast twice", () => {
  it("lets a creature that attacked boast twice on your turn, and no third time", () => {
    const { game, berserker } = attacked(15, ["Birgi, God of Storytelling"]);
    expect(boast(game, berserker)).toHaveLength(1);
    activate(game, berserker, 0);
    expect(tokensNamed(game, "Dragon Token", A)).toBe(1);
    expect(boast(game, berserker)).toHaveLength(1);
    activate(game, berserker, 0);
    expect(tokensNamed(game, "Dragon Token", A)).toBe(2);
    expect(boast(game, berserker)).toHaveLength(0);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: berserker, abilityIndex: 0, targets: [] })).toContain(
      "already been activated",
    );
  });

  it("gives each creature its own two", () => {
    const t = table();
    const { game, a } = t;
    const one = spawn(game, "Dragonkin Berserker");
    const two = spawn(game, "Dragonkin Berserker");
    spawn(game, "Birgi, God of Storytelling");
    lands(game, "Mountain", 20);
    attack(game, a, [one, two]);
    activate(game, one, 0);
    activate(game, one, 0);
    expect(boast(game, one)).toHaveLength(0);
    activate(game, two, 0);
    activate(game, two, 0);
    expect(tokensNamed(game, "Dragon Token", A)).toBe(4);
  });

  it("still needs the attack (its ruling)", () => {
    const { game } = table();
    const berserker = spawn(game, "Dragonkin Berserker");
    spawn(game, "Birgi, God of Storytelling");
    lands(game, "Mountain", 10);
    expect(boast(game, berserker)).toHaveLength(0);
  });

  it("does nothing without Birgi, or with an opponent's", () => {
    const { game, berserker } = attacked(10, []);
    spawn(game, "Birgi, God of Storytelling", B);
    activate(game, berserker, 0);
    expect(boast(game, berserker)).toHaveLength(0);
  });

  it("stops once Birgi has left, for a creature that has boasted once", () => {
    const { game, berserker } = attacked(10, ["Birgi, God of Storytelling"]);
    const birgi = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Birgi, God of Storytelling");
    activate(game, berserker, 0);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [{ kind: "object", object: birgi as ObjectId }]);
    settle(game);
    expect(boast(game, berserker)).toHaveLength(0);
  });

  it("is only on your own turn: a creature gained on another's turn boasts once", () => {
    const { game } = table();
    const berserker = spawn(game, "Dragonkin Berserker");
    spawn(game, "Birgi, God of Storytelling");
    lands(game, "Mountain", 15);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.priority.holder === A);
    game.state.objects[berserker].attackedThisTurn = true;
    expect(boast(game, berserker)).toHaveLength(1);
    activate(game, berserker, 0, { settle: false });
    expect(boast(game, berserker)).toHaveLength(0);
  });
});

describe("Birgi: the mana", () => {
  it("adds {R} as a trigger on the stack as you cast, kept through steps, gone at the end of the turn", () => {
    const { game } = table();
    spawn(game, "Birgi, God of Storytelling");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"), { settle: false });
    // The spell and Birgi's trigger: not a mana ability (the ruling).
    expect(game.state.zones.shared.stack).toHaveLength(2);
    expect(poolCounts(game.state.players[A].manaPool).R).toBe(0);
    settle(game);
    expect(poolCounts(game.state.players[A].manaPool).R).toBe(1);
    toStep(game, "end");
    expect(poolCounts(game.state.players[A].manaPool).R).toBe(1);
    nextTurn(game);
    expect(poolCounts(game.state.players[A].manaPool).R).toBe(0);
  });

  it("isn't set off by an opponent's spell", () => {
    const { game } = table();
    spawn(game, "Birgi, God of Storytelling", B);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(poolCounts(game.state.players[B].manaPool).R).toBe(0);
    expect(poolCounts(game.state.players[A].manaPool).R).toBe(0);
  });
});

describe("Harnfel, Horn of Bounty", () => {
  it("discards a card to exile the top two, each playable this turn only", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    const harnfel = toHand(game, "Birgi, God of Storytelling");
    cast(game, harnfel, { face: 1 });
    const fodder = toHand(game, "Grizzly Bears");
    const spell = toLibrary(game, "Lightning Bolt");
    const land = toLibrary(game, "Mountain");
    a.chooseDiscardsFn = () => [fodder];
    activate(game, harnfel, 0);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, spell)).toBe("exile");
    expect(zone(game, land)).toBe("exile");
    const playable = (id: ObjectId) =>
      game.legalActions(A).some((x) => (x.kind === "cast-spell" || x.kind === "play-land") && x.card === id);
    expect(playable(land)).toBe(true);
    expect(playable(spell)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(playable(land)).toBe(false);
    expect(zone(game, land)).toBe("exile");
  });

  it("is the card's back face: cast as either, with that face's cost and text", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    const card = toHand(game, "Birgi, God of Storytelling");
    const faces = game
      .legalActions(A)
      .filter((x) => x.kind === "cast-spell" && x.card === card)
      .map((x) => (x.kind === "cast-spell" ? x.cardName : ""));
    expect(faces).toEqual(expect.arrayContaining(["Birgi, God of Storytelling", "Harnfel, Horn of Bounty"]));
    cast(game, card, { face: 1 });
    expect(zone(game, card)).toBe("battlefield");
    expect(game.state.objects[card].face).toBe(1);
    const fodder = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [fodder];
    activate(game, card, 0);
    expect(zone(game, fodder)).toBe("graveyard");
  });
});
