/**
 * One `instead`, one resolved record (need-key-themes theme 9): rules 614.1a,
 * 614.5, 614.6, 615.6, 615.7, 615.12, 616.1, and the proving cards.
 */
import { describe, expect, it } from "vitest";
import { A, B, cast, lands, nextTurn, pickModes, ref, settle, spawn, table, toHand, zone } from "./harness.js";
import { POOL_CARDS } from "../cards/generated.js";
import type { ReplacementSpec } from "../replacements.js";

const life = (game: ReturnType<typeof table>["game"], p: typeof A) => game.state.players[p].life;
const hand = (game: ReturnType<typeof table>["game"], p: typeof A) => game.state.zones.perPlayer[p].hand;

describe("an event replaced by an effect (rules 614.1a, 614.6)", () => {
  it("Soul-Scar Mage: no damage is dealt, that many -1/-1 counters instead", () => {
    const { game } = table();
    spawn(game, "Soul-Scar Mage", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const source = spawn(game, "Grizzly Bears", A);
    game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(bears)], { source });
    settle(game);
    expect(game.state.objects[bears].counters["-1/-1"]).toBe(1);
    expect(game.state.objects[bears].damageMarked).toBe(0);
    expect(game.state.eventLog.some((e) => e.type === "damage-prevented")).toBe(false);
  });

  it("works on damage that can't be prevented (615.12 stops prevention, not replacement)", () => {
    const { game } = table();
    spawn(game, "Soul-Scar Mage", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const source = spawn(game, "Grizzly Bears", A);
    game.debugApplyEffect(A, { kind: "damage-cant-be-prevented" });
    game.debugApplyEffect(A, { kind: "damage", amount: 2, target: 0 }, [ref(bears)], { source });
    settle(game);
    expect(game.state.objects[bears].counters["-1/-1"]).toBe(2);
  });

  it("Hullbreacher: an opponent's extra draw becomes a Treasure, their draw step's first doesn't", () => {
    const { game } = table();
    const hullbreacher = spawn(game, "Hullbreacher", A);
    expect(zone(game, hullbreacher)).toBe("battlefield");
    const before = hand(game, B).length;
    game.debugApplyEffect(B, { kind: "draw", amount: 1 });
    settle(game);
    expect(hand(game, B).length).toBe(before);
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Treasure Token")).toHaveLength(1);
  });

  it("Eruth: the top two cards exiled, playable this turn, nothing drawn", () => {
    const { game } = table();
    spawn(game, "Eruth, Tormented Prophet", A);
    const handBefore = hand(game, A).length;
    const exileBefore = game.state.zones.shared.exile.length;
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(hand(game, A).length).toBe(handBefore);
    expect(game.state.zones.shared.exile.length - exileBefore).toBe(2);
  });
});

describe("a modified event and what's done beside it", () => {
  it("Wolverine: the damage is dealt, the old damage healed first", () => {
    const { game } = table();
    const wolverine = spawn(game, "Wolverine, Fierce Fighter", A);
    const source = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(wolverine)], { source });
    settle(game);
    expect(game.state.objects[wolverine].damageMarked).toBe(2);
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(wolverine)], { source });
    settle(game);
    expect(game.state.objects[wolverine].damageMarked).toBe(3);
  });

  it("Forethought Amulet caps only 3 or more, only from an instant or sorcery", () => {
    const { game } = table();
    spawn(game, "Forethought Amulet", A);
    const bolt = game.debugSpawn("Lightning Bolt", B, "stack");
    game.debugApplyEffect(B, { kind: "damage", amount: 5, target: 0 }, [ref(A)], { source: bolt });
    expect(life(game, A)).toBe(18);
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "damage", amount: 5, target: 0 }, [ref(A)], { source: bears });
    expect(life(game, A)).toBe(13);
  });

  it("Blood Scrivener: two cards and 1 life with an empty hand, an ordinary draw otherwise", () => {
    const { game } = table();
    spawn(game, "Blood Scrivener", A);
    game.state.zones.perPlayer[A].hand = [];
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(hand(game, A)).toHaveLength(2);
    expect(life(game, A)).toBe(19);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(hand(game, A)).toHaveLength(3);
    expect(life(game, A)).toBe(19);
  });

  it("Quantum Riddler: a draw of N becomes N + 1, once per instruction, only with 1 or fewer cards", () => {
    const { game } = table();
    spawn(game, "Quantum Riddler", A);
    game.state.zones.perPlayer[A].hand = [];
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    settle(game);
    expect(hand(game, A)).toHaveLength(3);
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    settle(game);
    expect(hand(game, A)).toHaveLength(5);
  });

  it("Alms Collector: an opponent's two-or-more becomes one each", () => {
    const { game } = table();
    spawn(game, "Alms Collector", A);
    const [a, b] = [hand(game, A).length, hand(game, B).length];
    game.debugApplyEffect(B, { kind: "draw", amount: 3 });
    settle(game);
    expect(hand(game, A).length).toBe(a + 1);
    expect(hand(game, B).length).toBe(b + 1);
  });

  it("Doc Samson: one more of each kind you put on a permanent you control", () => {
    const { game } = table();
    spawn(game, "Doc Samson, Super Psychiatrist", A);
    const bears = spawn(game, "Grizzly Bears", A);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(bears)]);
    settle(game);
    expect(game.state.objects[bears].counters["+1/+1"]).toBe(3);
  });

  it("Eligeth: a scry of N is N cards drawn", () => {
    const { game } = table();
    spawn(game, "Eligeth, Crossroads Augur", A);
    const before = hand(game, A).length;
    game.debugApplyEffect(A, { kind: "scry", amount: 3 });
    settle(game);
    expect(hand(game, A).length).toBe(before + 3);
  });
});

describe("losing the game (rules 104.3, 704.5a, 614.6)", () => {
  /** The next check of state-based actions: priority passes on. */
  const sbas = (game: ReturnType<typeof table>["game"]) =>
    game.advanceUntil((s) => s.result.over || s.turn.step !== "precombat-main" || s.players[A].hasLost);

  it("The Golden Throne takes the loss: exiled, life 1, and only once", () => {
    const { game } = table();
    const throne = spawn(game, "The Golden Throne", A);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 20 });
    sbas(game);
    expect(game.state.players[A].hasLost).toBe(false);
    expect(life(game, A)).toBe(1);
    expect(zone(game, throne)).toBe("exile");
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1 });
    game.advanceUntil((s) => s.result.over || s.players[A].hasLost);
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("Stunning Reversal's next time: seven cards, life 1, and a second loss stands", () => {
    const { game } = table();
    lands(game, "Swamp", 4, A);
    cast(game, toHand(game, "Stunning Reversal", A));
    expect(game.state.activeReplacements.filter((r) => r.replacement.event === "would-lose-game")).toHaveLength(1);
    const before = hand(game, A).length;
    game.debugApplyEffect(A, { kind: "lose-life", amount: 25 });
    sbas(game);
    expect(game.state.players[A].hasLost).toBe(false);
    expect(life(game, A)).toBe(1);
    expect(hand(game, A).length).toBe(before + 7);
    expect(game.state.activeReplacements.filter((r) => r.replacement.event === "would-lose-game")).toHaveLength(0);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1 });
    game.advanceUntil((s) => s.result.over || s.players[A].hasLost);
    expect(game.state.players[A].hasLost).toBe(true);
  });
});

describe("resolved replacements and their durations (611.2c, 615.3, 615.8)", () => {
  it("Isengard Unleashed: triple to opponents' side for the turn, and it ends", () => {
    const { game } = table();
    lands(game, "Mountain", 5, A);
    cast(game, toHand(game, "Isengard Unleashed", A));
    const source = spawn(game, "Grizzly Bears", A);
    game.debugApplyEffect(A, { kind: "damage", amount: 2, target: 0 }, [ref(B)], { source });
    expect(life(game, B)).toBe(14);
    game.debugApplyEffect(A, { kind: "damage", amount: 2, target: 0 }, [ref(A)], { source });
    expect(life(game, A)).toBe(18);
    nextTurn(game);
    expect(game.state.activeReplacements.filter((r) => r.replacement.event === "would-deal-damage")).toHaveLength(0);
  });

  it("Plagiarize names one player's draws, fixed as it resolves, for the turn", () => {
    const { game } = table();
    game.debugApplyEffect(
      A,
      { kind: "replacement-effect", duration: "end-of-turn", players: { target: 0 }, replacement: { event: "would-draw", who: "any-player", instead: { effect: { kind: "draw", amount: 1 } } } },
      [ref(B)],
    );
    const [a, b] = [hand(game, A).length, hand(game, B).length];
    game.debugApplyEffect(B, { kind: "draw", amount: 1 });
    settle(game);
    expect(hand(game, A).length).toBe(a + 1);
    expect(hand(game, B).length).toBe(b);
    // Your own draw is yours: the record names only that player.
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(hand(game, A).length).toBe(a + 2);
  });

  it("Plagiarize on yourself: its own draw isn't replaced by it again (614.5)", () => {
    const { game } = table();
    const before = hand(game, A).length;
    game.debugApplyEffect(
      A,
      { kind: "replacement-effect", duration: "end-of-turn", players: { target: 0 }, replacement: { event: "would-draw", who: "any-player", instead: { effect: { kind: "draw", amount: 1 } } } },
      [ref(A)],
    );
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("a next-time record is spent once it has applied, on the second draw nothing happens", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "replacement-effect", duration: "end-of-turn", next: true, replacement: { event: "would-draw", who: "you", instead: { effect: { kind: "gain-life", amount: 3 } } } });
    const before = hand(game, A).length;
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    settle(game);
    expect(life(game, A)).toBe(23);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("the next N damage counts down over one record (615.7)", () => {
    const { game } = table();
    const source = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "replacement-effect", duration: "end-of-turn", next: 3, replacement: { event: "would-deal-damage", to: "you", instead: { prevent: true } } });
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(A)], { source });
    expect(life(game, A)).toBe(20);
    expect(game.state.activeReplacements[0]?.left).toBe(1);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(A)], { source });
    expect(life(game, A)).toBe(19);
    expect(game.state.activeReplacements).toHaveLength(0);
  });
});

describe("leaving (rules 614.1a, 700.4)", () => {
  it("Nissa's Chosen goes to the bottom of its library", () => {
    const { game } = table();
    const chosen = spawn(game, "Nissa's Chosen", A);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(chosen)]);
    settle(game);
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(chosen);
  });

  it("Necromancer's Magemark returns an enchanted creature you control to its owner's hand", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const aura = game.debugSpawn("Necromancer's Magemark", A, "battlefield");
    game.state.objects[aura].attachedTo = bears;
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Moonlit Meditation (a may on a token event)", () => {
  it("offers copies instead the first time, and the token event is the player's", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const aura = game.debugSpawn("Moonlit Meditation", A, "battlefield");
    game.state.objects[aura].attachedTo = bears;
    pickModes(a, 1);
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 2 });
    settle(game);
    const names = () => game.state.zones.shared.battlefield.map((id) => game.state.objects[id]);
    expect(names().filter((o) => o.cardName === "Treasure Token")).toHaveLength(0);
    expect(names().filter((o) => o.isToken === true && o.cardName === "Grizzly Bears").reduce((n, o) => n + (o.stackCount ?? 1), 0)).toBe(2);
    // Not the first time now: the event goes as it was going to.
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 });
    settle(game);
    expect(names().filter((o) => o.cardName === "Treasure Token")).toHaveLength(1);
  });

  it("declined, the tokens are made as the effect said", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const aura = game.debugSpawn("Moonlit Meditation", A, "battlefield");
    game.state.objects[aura].attachedTo = bears;
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 2 });
    settle(game);
    const treasures = game.state.zones.shared.battlefield.map((id) => game.state.objects[id]).filter((o) => o.cardName === "Treasure Token");
    expect(treasures.reduce((n, o) => n + (o.stackCount ?? 1), 0)).toBe(2);
  });
});

describe("a token copy is a token event too", () => {
  it("Moonlit Meditation is offered on a create-token-copy, and its own copies aren't replaced again (614.5)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const aura = game.debugSpawn("Moonlit Meditation", A, "battlefield");
    game.state.objects[aura].attachedTo = bears;
    const giant = spawn(game, "Hill Giant", A);
    pickModes(a, 1);
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1 }, [ref(giant)]);
    settle(game);
    const tokens = game.state.zones.shared.battlefield.map((id) => game.state.objects[id]).filter((o) => o.isToken === true);
    expect(tokens.map((o) => o.cardName)).toEqual(["Grizzly Bears"]);
  });
});

describe("tokens made inside another effect are token events too (rule 614.1a)", () => {
  const moonlit = (game: ReturnType<typeof table>["game"]): void => {
    const bears = spawn(game, "Grizzly Bears", A);
    const aura = game.debugSpawn("Moonlit Meditation", A, "battlefield");
    game.state.objects[aura].attachedTo = bears;
  };
  const tokens = (game: ReturnType<typeof table>["game"]): string[] =>
    game.state.zones.shared.battlefield
      .map((id) => game.state.objects[id])
      .filter((o) => o.isToken === true)
      .flatMap((o) => Array.from({ length: o.stackCount ?? 1 }, () => o.cardName));

  it("incubate: taken, the copy instead of the Incubator", () => {
    const { game, a } = table();
    moonlit(game);
    pickModes(a, 1);
    game.debugApplyEffect(A, { kind: "incubate", amount: 2 });
    settle(game);
    expect(tokens(game)).toEqual(["Grizzly Bears"]);
  });

  it("incubate: declined, the Incubator with its counters", () => {
    const { game, a } = table();
    moonlit(game);
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "incubate", amount: 2 });
    settle(game);
    expect(tokens(game)).toEqual(["Incubator Token"]);
  });

  it("amass with no Army: taken, the copy instead, and no Army to put counters on (701.47b)", () => {
    const { game, a } = table();
    moonlit(game);
    pickModes(a, 1);
    game.debugApplyEffect(A, { kind: "amass", amount: 2, creatureType: "Zombie" });
    settle(game);
    expect(tokens(game)).toEqual(["Grizzly Bears"]);
  });

  it("amass with an Army makes no token, so nothing is asked", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "amass", amount: 1, creatureType: "Zombie" });
    settle(game);
    moonlit(game);
    nextTurn(game);
    let asked = 0;
    a.chooseModesFn = () => ((asked += 1), [1]);
    game.debugApplyEffect(A, { kind: "amass", amount: 1, creatureType: "Zombie" });
    settle(game);
    expect(asked).toBe(0);
  });

  it("populate: taken, the copy of the enchanted permanent instead", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Bird Token", count: 1 });
    settle(game);
    nextTurn(game);
    moonlit(game);
    pickModes(a, 1);
    game.debugApplyEffect(A, { kind: "populate" });
    settle(game);
    expect(tokens(game).sort()).toEqual(["Bird Token", "Grizzly Bears"]);
  });

  it("populate with no creature token makes none, so nothing is asked", () => {
    const { game, a } = table();
    moonlit(game);
    let asked = 0;
    a.chooseModesFn = () => ((asked += 1), [1]);
    game.debugApplyEffect(A, { kind: "populate" });
    settle(game);
    expect(asked).toBe(0);
    expect(tokens(game)).toEqual([]);
  });

  it("encore: taken, that many copies of the enchanted permanent, one for each opponent", () => {
    const { game, a } = table({ players: 3 });
    moonlit(game);
    pickModes(a, 1);
    const card = game.debugSpawn("Hill Giant", A, "exile");
    game.debugApplyEffect(A, { kind: "encore" }, [], { source: card });
    settle(game);
    expect(tokens(game)).toEqual(["Grizzly Bears", "Grizzly Bears"]);
  });
});

describe("the vocabulary, pool-wide", () => {
  const replacements = (): { card: string; r: ReplacementSpec }[] =>
    POOL_CARDS.flatMap((c) => (c.static ?? []).flatMap((s) => (s.replacement === undefined ? [] : [{ card: c.name, r: s.replacement }])));

  it("no removed amount spelling survives in a definition", () => {
    const removed = ["multiplier", "plusOf", "halved", "halve", "preventAmount", "preventAllBut", "preventHalf", "additional"];
    const offenders = replacements().flatMap(({ card, r }) => removed.filter((k) => k in r).map((k) => `${card}: ${k}`));
    expect(offenders).toEqual([]);
  });

  it("a `may` sits only on events that can wait for an answer", () => {
    const canWait = new Set(["would-draw", "would-create-token", "would-begin-turn"]);
    const offenders = replacements().flatMap(({ card, r }) => ("may" in r && r.may === true && !canWait.has(r.event) ? [`${card}: ${r.event}`] : []));
    expect(offenders).toEqual([]);
  });

  it("no card uses the removed resolved-replacement words", () => {
    const text = JSON.stringify(POOL_CARDS.map((c) => [c.effect, c.activated, c.triggered, c.static]));
    for (const word of ["damageReplacement", "damageTo", "nextDrawInstead", "graveyardExile", "tokenMultiplier"]) {
      expect(text.includes(`"${word}"`), word).toBe(false);
    }
  });
});

