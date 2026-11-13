// Batch 320: the top 5000's next cards by EDHREC rank (4407–), each on the
// feature it needed.

import { describe, expect, it } from "vitest";

import { A, B, C, cast, counters, keywords, lands, life, named, pickModes, pt, ref, settle, spawn, table, toHand, tokensNamed, zone } from "./harness.js";

describe("Jinnie Fay, Jetmir's Second: you may make that many Cats or Dogs instead", () => {
  const CAT = "2/2 Green Cat Token (Haste)";
  const DOG = "3/1 Green Dog Token (Vigilance)";

  it("taking the Cats: that many 2/2 hasty Cats, and none of the tokens", () => {
    const { game, a } = table();
    spawn(game, "Jinnie Fay, Jetmir's Second");
    pickModes(a, 1);
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 3 }, []);
    settle(game);
    expect(tokensNamed(game, CAT, A)).toBe(3);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
    const cat = named(game, CAT, A)[0];
    expect(pt(game, cat)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, cat)).toContain("haste");
  });

  it("taking the Dogs, what the effect says of its tokens still holds: they enter tapped", () => {
    const { game, a } = table();
    spawn(game, "Jinnie Fay, Jetmir's Second");
    pickModes(a, 2);
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 2, tapped: true }, []);
    settle(game);
    expect(tokensNamed(game, DOG, A)).toBe(2);
    expect(named(game, DOG, A).every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("declining keeps the tokens; an opponent's tokens aren't asked about", () => {
    const { game, a } = table();
    spawn(game, "Jinnie Fay, Jetmir's Second");
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 2 }, []);
    settle(game);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Soldier Token", B)).toBe(1);
    expect(tokensNamed(game, CAT)).toBe(0);
  });

  it("a doubler doubles the Cats (rule 616.1)", () => {
    const { game, a } = table();
    spawn(game, "Jinnie Fay, Jetmir's Second");
    spawn(game, "Anointed Procession");
    pickModes(a, 1);
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    expect(tokensNamed(game, CAT, A)).toBe(2);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(0);
  });

  it("a copy token is made as a Cat too", () => {
    const { game, a } = table();
    spawn(game, "Jinnie Fay, Jetmir's Second");
    const bear = spawn(game, "Grizzly Bears");
    pickModes(a, 1);
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1 }, [{ kind: "object", object: bear }]);
    settle(game);
    expect(tokensNamed(game, CAT, A)).toBe(1);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
  });
});

describe("Master Chef: commander creatures you own have two enters-with-a-counter replacements", () => {
  it("the commander enters with an additional counter (rule 614.12), and other creatures after it with one", () => {
    const { game } = table();
    spawn(game, "Master Chef");
    lands(game, "Forest", 4);
    const commander = toHand(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    cast(game, commander);
    expect(counters(game, commander)).toBe(1);
    const bear = toHand(game, "Grizzly Bears");
    cast(game, bear);
    expect(counters(game, bear)).toBe(1);
  });

  it("without the commander out, others get nothing; an opponent's creatures never do", () => {
    const { game } = table();
    spawn(game, "Master Chef");
    lands(game, "Forest", 2);
    const bear = toHand(game, "Grizzly Bears");
    cast(game, bear);
    expect(counters(game, bear)).toBe(0);
    const commander = spawn(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(counters(game, theirs)).toBe(0);
  });

  it("a commander you don't own gets nothing", () => {
    const { game } = table();
    spawn(game, "Master Chef");
    lands(game, "Forest", 2);
    const commander = toHand(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    (game.state.objects[commander] as { owner: typeof B }).owner = B;
    cast(game, commander);
    expect(counters(game, commander)).toBe(0);
  });
});

describe("Tifa's Limit Break: tiered, doubling or tripling power and toughness", () => {
  it("Final Heaven costs {G} plus {6}{G} and triples: a 2/2 is a 6/6", () => {
    const { game } = table();
    const forests = lands(game, "Forest", 8);
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Tifa's Limit Break"), { modes: [2], targets: [ref(bear)] });
    expect(forests.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(pt(game, bear)).toEqual({ power: 6, toughness: 6 });
  });

  it("a negative power is tripled as it is (rule 701.10d): -1/3 becomes -3/9", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    const bear = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: -3, toughness: 1, duration: "end-of-turn" }, [ref(bear)]);
    settle(game);
    expect(pt(game, bear)).toEqual({ power: -1, toughness: 3 });
    cast(game, toHand(game, "Tifa's Limit Break"), { modes: [2], targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: -3, toughness: 9 });
  });

  it("Meteor Strikes doubles for {2} more", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Tifa's Limit Break"), { modes: [1], targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Shadowgrange Archfiend: madness paid with {2}{B} and 8 life; the greatest power, as life", () => {
  function castForMadness(seat: ReturnType<typeof table>["a"]): void {
    seat.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0]!;
      return { type: "cast-spell", player: seat.playerId, card: way.card, targets: [], via: way.via };
    };
  }

  it("discarded and cast for madness: three lands and 8 life; each opponent sacrifices its biggest", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const fiend = toHand(game, "Shadowgrange Archfiend");
    a.chooseDiscardsFn = () => [fiend];
    castForMadness(a);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    const bear = spawn(game, "Grizzly Bears", B);
    const before = life(game, A);
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 });
    settle(game);
    expect(zone(game, fiend)).toBe("battlefield");
    expect(zone(game, dreadmaw)).toBe("graveyard");
    expect(zone(game, bear)).toBe("battlefield");
    // Paid 8 life, gained the Dreadmaw's 6.
    expect(life(game, A)).toBe(before - 8 + 6);
  });

  it("with less than 8 life to pay, it can't be cast for madness", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    game.state.players[A].life = 7;
    const fiend = toHand(game, "Shadowgrange Archfiend");
    a.chooseDiscardsFn = () => [fiend];
    castForMadness(a);
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 });
    settle(game);
    expect(zone(game, fiend)).toBe("graveyard");
    expect(life(game, A)).toBe(7);
  });

  it("cast from hand, the greatest power among everything sacrificed (4 players)", () => {
    const { game } = table({ players: 4 });
    lands(game, "Swamp", 7);
    spawn(game, "Grizzly Bears", B);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", C);
    const before = life(game, A);
    cast(game, toHand(game, "Shadowgrange Archfiend"));
    expect(zone(game, dreadmaw)).toBe("graveyard");
    expect(life(game, A)).toBe(before + 6);
  });
});
