/**
 * The set walk, batch 66, part e (2026-10-12): the cards the `left` turn
 * history and a warped spell's cast record unblock — void (Edge of
 * Eternities), revolt (Aether Revolt), disappear (TMNT) and the other "a
 * permanent you controlled left the battlefield this turn" cards. Written on
 * the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";

import {
  A,
  B,
  attack,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
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
  types,
  zone,
} from "./harness.js";

/** One of `player`'s nonland permanents leaves the battlefield (returned to
 * its owner's hand): revolt for them, void for everyone. */
function leaveOne(game: Game, player: PlayerId = A): void {
  const ring = spawn(game, "Sol Ring", player);
  game.debugApplyEffect(player, { kind: "return-to-hand", target: 0 }, [ref(ring)]);
  settle(game);
}

/** Run to alice's end step and let everything there resolve. */
function endStep(game: Game): void {
  toStep(game, "end");
  settle(game);
}

/** Answer every cast-now offer by casting the first card on offer, with
 * these targets. */
function castCopy(seat: ScriptedController, targets: readonly ObjectId[] | readonly PlayerId[] = []): { cast: number } {
  const seen = { cast: 0 };
  seat.chooseCastNowFn = (_view, offer) => {
    const way = offer.casts[0];
    if (way === undefined) return null;
    seen.cast += 1;
    return {
      type: "cast-spell",
      player: seat.playerId,
      card: way.card,
      targets: targets.map((t) => ref(t)),
      via: way.via,
      ...(offer.free ? { free: true } : {}),
    };
  };
  return seen;
}

// ------------------------------------------------------------------ void

describe("Alpharael, Stonechosen", () => {
  it("with void, defending player loses half their life, rounded up, as it attacks", () => {
    const { game, a } = table({ life: 21 });
    const alpharael = spawn(game, "Alpharael, Stonechosen");
    attack(game, a, [alpharael]);
    expect(life(game, B)).toBe(18);
    nextTurn(game);
    toStep(game, "precombat-main");
    leaveOne(game, B);
    attack(game, a, [alpharael]);
    // 18 → 9 (half of 18) → 6 after combat damage.
    expect(life(game, B)).toBe(6);
  });

  it("has ward — discard a card at random: nobody picks which", () => {
    const { game, a } = table();
    const alpharael = spawn(game, "Alpharael, Stonechosen", B);
    lands(game, "Mountain", 1);
    const keep = [...hand(game), toHand(game, "Grizzly Bears"), toHand(game, "Hill Giant"), toHand(game, "Forest")];
    const bolt = toHand(game, "Lightning Bolt");
    // Alice pays the ward cost.
    pickModes(a, 0);
    let asked = false;
    a.chooseDiscardsFn = () => {
      asked = true;
      return [];
    };
    cast(game, bolt, { targets: [ref(alpharael)] });
    expect(asked).toBe(false);
    expect(keep.filter((id) => zone(game, id) === "graveyard")).toHaveLength(1);
    expect(zone(game, alpharael)).toBe("graveyard");
  });
});

describe("Chorale of the Void", () => {
  it("puts a creature card from defending player's graveyard onto the battlefield tapped and attacking", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    const chorale = toHand(game, "Chorale of the Void");
    cast(game, chorale, { targets: [ref(bears)] });
    expect(game.state.objects[chorale].attachedTo).toBe(bears);
    const giant = toGraveyard(game, "Hill Giant", B);
    pickTargets(a, giant);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" || s.turn.step === "combat-damage");
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].controller).toBe(A);
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(game.state.objects[giant].attacking).toBe(B);
    toStep(game, "postcombat-main");
    // 2 + 3 combat damage.
    expect(life(game, B)).toBe(15);
  });

  it("is sacrificed at your end step unless void — read as the trigger resolves", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    const chorale = toHand(game, "Chorale of the Void");
    cast(game, chorale, { targets: [ref(bears)] });
    leaveOne(game, B);
    endStep(game);
    expect(zone(game, chorale)).toBe("battlefield");
    nextTurn(game);
    toStep(game, "precombat-main");
    endStep(game);
    expect(zone(game, chorale)).toBe("graveyard");
  });
});

describe("Decode Transmissions", () => {
  it("draws two and loses 2 life; with void, each opponent loses 2 instead", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const before = hand(game).length;
    cast(game, toHand(game, "Decode Transmissions"));
    expect(hand(game).length).toBe(before + 2);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(20);
    leaveOne(game, B);
    cast(game, toHand(game, "Decode Transmissions"));
    expect(hand(game).length).toBe(before + 4);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(18);
  });
});

describe("Elegy Acolyte", () => {
  it("draws and loses 1 life on combat damage, and makes a Robot at your end step with void", () => {
    const { game, a } = table();
    const acolyte = spawn(game, "Elegy Acolyte");
    const before = hand(game).length;
    attack(game, a, [acolyte]);
    expect(life(game, B)).toBe(16);
    // Lifelink 4, then 1 lost.
    expect(life(game, A)).toBe(23);
    expect(hand(game).length).toBe(before + 1);
    endStep(game);
    expect(tokensNamed(game, "Robot Token", A)).toBe(0);
    nextTurn(game);
    toStep(game, "precombat-main");
    leaveOne(game, B);
    endStep(game);
    expect(tokensNamed(game, "Robot Token", A)).toBe(1);
  });
});

describe("Hylderblade", () => {
  it("attaches itself to target creature you control at your end step with void, and gives +3/+1", () => {
    const { game, a } = table();
    const blade = spawn(game, "Hylderblade");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    endStep(game);
    expect(game.state.objects[blade].attachedTo ?? null).toBeNull();
    nextTurn(game);
    toStep(game, "precombat-main");
    leaveOne(game);
    pickTargets(a, bears);
    endStep(game);
    expect(game.state.objects[blade].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 3 });
  });
});

describe("Hymn of the Faller", () => {
  it("surveils 1, draws a card and loses 1 life, and with void draws another", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const before = hand(game).length;
    cast(game, toHand(game, "Hymn of the Faller"));
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(19);
    leaveOne(game, B);
    cast(game, toHand(game, "Hymn of the Faller"));
    expect(hand(game).length).toBe(before + 3);
    expect(life(game, A)).toBe(18);
  });
});

describe("Insatiable Skittermaw, Interceptor Mechan, Kavaron Skywarden", () => {
  for (const name of ["Insatiable Skittermaw", "Interceptor Mechan", "Kavaron Skywarden"]) {
    it(`${name} gets a +1/+1 counter at your end step only with void`, () => {
      const { game } = table();
      const it_ = spawn(game, name);
      endStep(game);
      expect(counters(game, it_)).toBe(0);
      nextTurn(game);
      toStep(game, "precombat-main");
      leaveOne(game, B);
      endStep(game);
      expect(counters(game, it_)).toBe(1);
    });
  }

  it("Interceptor Mechan returns an artifact or creature card from your graveyard as it enters", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    lands(game, "Mountain", 4);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Interceptor Mechan"));
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Plasma Bolt", () => {
  it("deals 2 damage, or 3 with void", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Plasma Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    destroy(game, spawn(game, "Grizzly Bears", B));
    cast(game, toHand(game, "Plasma Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
  });
});

describe("Roving Actuator", () => {
  it("with void, exiles an instant or sorcery card with mana value 2 or less from your graveyard and casts a copy free", () => {
    const { game, a } = table();
    const whisper = toGraveyard(game, "Night's Whisper");
    const divination = toGraveyard(game, "Divination");
    lands(game, "Mountain", 8);
    leaveOne(game, B);
    const offered: ObjectId[][] = [];
    a.chooseTargetsFn = (_v, _n, _specs, options) => {
      offered.push(options[0].map((t) => (t.kind === "object" ? t.object : (t.player as unknown as ObjectId))));
      return [ref(whisper)];
    };
    const seen = castCopy(a);
    const before = hand(game).length;
    cast(game, toHand(game, "Roving Actuator"));
    expect(offered[0]).toContain(whisper);
    expect(offered[0]).not.toContain(divination);
    expect(zone(game, whisper)).toBe("exile");
    expect(seen.cast).toBe(1);
    expect(hand(game).length).toBe(before + 2);
    expect(life(game, A)).toBe(18);
  });

  it("doesn't trigger without void (an intervening if, rule 603.4)", () => {
    const { game, a } = table();
    const whisper = toGraveyard(game, "Night's Whisper");
    lands(game, "Mountain", 4);
    pickTargets(a, whisper);
    cast(game, toHand(game, "Roving Actuator"));
    expect(zone(game, whisper)).toBe("graveyard");
  });
});

describe("Tragic Trajectory", () => {
  it("gives -2/-2, or -10/-10 with void", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Tragic Trajectory"), { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
    const titan = spawn(game, "Voidforged Titan", B);
    cast(game, toHand(game, "Tragic Trajectory"), { targets: [ref(titan)] });
    // The first cast's -2/-2 doesn't make anything leave: still -2/-2.
    expect(pt(game, titan)).toEqual({ power: 3, toughness: 2 });
    leaveOne(game, B);
    cast(game, toHand(game, "Tragic Trajectory"), { targets: [ref(titan)] });
    expect(zone(game, titan)).toBe("graveyard");
  });
});

describe("Voidforged Titan", () => {
  it("draws a card and loses 1 life at your end step with void", () => {
    const { game } = table();
    spawn(game, "Voidforged Titan");
    const before = hand(game).length;
    endStep(game);
    expect(hand(game).length).toBe(before);
    nextTurn(game);
    toStep(game, "precombat-main");
    const mid = hand(game).length;
    leaveOne(game, B);
    endStep(game);
    expect(hand(game).length).toBe(mid + 1);
    expect(life(game, A)).toBe(19);
  });

  it("sees a spell warped this turn", () => {
    const { game } = table();
    spawn(game, "Voidforged Titan");
    lands(game, "Island", 2);
    cast(game, toHand(game, "Starfield Vocalist"), { via: "warp" });
    const before = hand(game).length;
    endStep(game);
    expect(hand(game).length).toBe(before + 1);
  });
});

// ------------------------------------------------------------------ revolt

describe("Aid from the Cowl", () => {
  it("with revolt, reveals the top card and may put a permanent card onto the battlefield", () => {
    const { game, a } = table();
    spawn(game, "Aid from the Cowl");
    const bears = toLibrary(game, "Grizzly Bears");
    leaveOne(game);
    pickModes(a, 0);
    endStep(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("may put a nonpermanent card on the bottom; doesn't trigger without revolt", () => {
    const { game, a } = table();
    spawn(game, "Aid from the Cowl");
    const bolt = toLibrary(game, "Lightning Bolt");
    endStep(game);
    expect(game.state.zones.perPlayer[A].library[0]).toBe(bolt);
    const again = table();
    spawn(again.game, "Aid from the Cowl");
    const second = toLibrary(again.game, "Lightning Bolt");
    leaveOne(again.game);
    pickModes(again.a, 0);
    endStep(again.game);
    const library = again.game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(second);
    void a;
  });
});

describe("revolt enters-the-battlefield triggers", () => {
  it("Airdrop Aeronauts gains 5 life only with revolt", () => {
    const { game } = table();
    lands(game, "Plains", 10);
    cast(game, toHand(game, "Airdrop Aeronauts"));
    expect(life(game, A)).toBe(20);
    leaveOne(game);
    cast(game, toHand(game, "Airdrop Aeronauts"));
    expect(life(game, A)).toBe(25);
  });

  it("Countless Gears Renegade makes a Servo; Silkweaver Elite draws; Hidden Herbalists adds {G}{G}", () => {
    const { game } = table();
    lands(game, "Forest", 10);
    lands(game, "Plains", 4);
    leaveOne(game);
    cast(game, toHand(game, "Countless Gears Renegade"));
    expect(tokensNamed(game, "Servo Token", A)).toBe(1);
    const before = hand(game).length;
    cast(game, toHand(game, "Silkweaver Elite"));
    expect(hand(game).length).toBe(before + 1);
    cast(game, toHand(game, "Hidden Herbalists"));
    expect(game.state.players[A].manaPool.filter((m) => m.type === "G")).toHaveLength(2);
  });

  it("revolt is about your permanents: an opponent's leaving does nothing for you", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    leaveOne(game, B);
    cast(game, toHand(game, "Airdrop Aeronauts"));
    expect(life(game, A)).toBe(20);
  });

  it("Deadeye Harpooner destroys a tapped creature an opponent controls; Vengeful Rebel gives -3/-3", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    lands(game, "Swamp", 3);
    const tapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    const giant = spawn(game, "Hill Giant", B);
    leaveOne(game);
    pickTargets(a, tapped);
    cast(game, toHand(game, "Deadeye Harpooner"));
    expect(zone(game, tapped)).toBe("graveyard");
    pickTargets(a, giant);
    cast(game, toHand(game, "Vengeful Rebel"));
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Renegade Rallier returns a permanent card with mana value 2 or less to the battlefield", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Plains", 1);
    const bears = toGraveyard(game, "Grizzly Bears");
    leaveOne(game);
    pickTargets(a, bears);
    cast(game, toHand(game, "Renegade Rallier"));
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Foot Mystic makes a Ninja", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    leaveOne(game);
    cast(game, toHand(game, "Foot Mystic"));
    expect(tokensNamed(game, "Ninja Token (Dark Leo & Shredder)", A)).toBe(1);
  });
});

describe("revolt and disappear end-step triggers", () => {
  const cases: [string, (game: Game, source: ObjectId) => unknown][] = [
    ["Call for Unity", (game, source) => counters(game, source, "unity")],
    ["Hidden Stockpile", (game) => tokensNamed(game, "Servo Token", A)],
    ["Solemn Recruit", (game, source) => counters(game, source)],
    ["Michelangelo, Game Master", (game, source) => counters(game, source)],
    ["Lord Dregg, Insect Invader", (game) => tokensNamed(game, "Insect Warrior Token", A)],
    ["Vrock", (game) => 20 - life(game, B)],
  ];
  for (const [name, read] of cases) {
    it(`${name}: only with revolt`, () => {
      const { game } = table();
      const source = spawn(game, name);
      endStep(game);
      const without = read(game, source);
      nextTurn(game);
      toStep(game, "precombat-main");
      leaveOne(game);
      endStep(game);
      expect(read(game, source)).not.toEqual(without);
    });
  }

  it("Call for Unity's creatures get +1/+1 per unity counter", () => {
    const { game } = table();
    spawn(game, "Call for Unity");
    const bears = spawn(game, "Grizzly Bears");
    leaveOne(game);
    endStep(game);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("Insectoid Exterminator scries 1; West Wind Avatar draws", () => {
    const { game, a } = table();
    spawn(game, "Insectoid Exterminator");
    spawn(game, "West Wind Avatar");
    let scried = 0;
    a.chooseScryFn = () => {
      scried += 1;
      return [];
    };
    leaveOne(game);
    const before = hand(game).length;
    endStep(game);
    expect(scried).toBe(1);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Shortcut to Mushrooms puts a +1/+1 counter on target creature you control", () => {
    const { game, a } = table();
    spawn(game, "Shortcut to Mushrooms");
    const bears = spawn(game, "Grizzly Bears");
    leaveOne(game);
    pickTargets(a, bears);
    endStep(game);
    expect(counters(game, bears)).toBe(1);
  });

  it("Lord Dregg sacrifices a token to draw", () => {
    const { game } = table();
    const dregg = spawn(game, "Lord Dregg, Insect Invader");
    leaveOne(game);
    endStep(game);
    nextTurn(game);
    toStep(game, "precombat-main");
    lands(game, "Forest", 4);
    const before = hand(game).length;
    const insect = game.battlefield.find((id) => game.state.objects[id].cardName === "Insect Warrior Token")!;
    game.dispatch({ type: "activate-ability", player: A, source: dregg, abilityIndex: 0, targets: [], sacrifice: insect });
    settle(game);
    expect(tokensNamed(game, "Insect Warrior Token", A)).toBe(0);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Lulu, Loyal Hollyphant puts a +1/+1 counter on each tapped creature you control, then untaps them", () => {
    const { game } = table();
    spawn(game, "Lulu, Loyal Hollyphant");
    const tapped = spawn(game, "Grizzly Bears", A, { tapped: true });
    const untapped = spawn(game, "Grizzly Bears");
    leaveOne(game);
    endStep(game);
    expect(counters(game, tapped)).toBe(1);
    expect(game.state.objects[tapped].tapped).toBe(false);
    expect(counters(game, untapped)).toBe(0);
  });

  it("Pizza Face makes a noncreature artifact a 0/0 Mutant creature with three +1/+1 counters", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Pizza Face, Gastromancer"));
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    const ring = spawn(game, "Sol Ring");
    leaveOne(game);
    pickTargets(a, ring);
    endStep(game);
    expect(counters(game, ring)).toBe(3);
    expect(types(game, ring)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, ring)).toContain("Mutant");
    expect(pt(game, ring)).toEqual({ power: 3, toughness: 3 });
  });

  it("Pizza Face leaves a creature's types alone, and can't target itself", () => {
    const { game, a } = table();
    const pizza = spawn(game, "Pizza Face, Gastromancer");
    const bears = spawn(game, "Grizzly Bears");
    leaveOne(game);
    let offered: string[] = [];
    a.chooseTargetsFn = (_v, _n, _specs, options) => {
      offered = options[0].map((t) => (t.kind === "object" ? t.object : t.player));
      return [ref(bears)];
    };
    endStep(game);
    expect(offered).not.toContain(pizza);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(subtypes(game, bears)).not.toContain("Mutant");
  });
});

describe("revolt enters-with-counters creatures", () => {
  const cases: [string, string, number, number][] = [
    ["Greenwheel Liberator", "Forest", 2, 2],
    ["Lifecraft Cavalry", "Forest", 5, 2],
    ["Narnam Renegade", "Forest", 1, 1],
    ["Night Market Aeronaut", "Swamp", 4, 1],
    ["Putrid Pals", "Forest", 4, 2],
  ];
  for (const [name, land, cost, n] of cases) {
    it(`${name} enters with ${n} +1/+1 counter(s) only with revolt`, () => {
      const { game } = table();
      lands(game, land, cost * 2);
      const first = toHand(game, name);
      cast(game, first);
      expect(counters(game, first)).toBe(0);
      leaveOne(game);
      const second = toHand(game, name);
      cast(game, second);
      expect(counters(game, second)).toBe(n);
    });
  }
});

describe("Decommission", () => {
  it("destroys an artifact or enchantment, and gains 3 life with revolt", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Decommission"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    leaveOne(game);
    const stone = spawn(game, "Mind Stone", B);
    cast(game, toHand(game, "Decommission"), { targets: [ref(stone)] });
    expect(zone(game, stone)).toBe("graveyard");
    expect(life(game, A)).toBe(23);
  });
});

describe("Fatal Push", () => {
  it("destroys a creature with mana value 2 or less; 4 or less with revolt; reads it as it resolves", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Fatal Push"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    cast(game, toHand(game, "Fatal Push"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    // An opponent's creature dying is no revolt.
    cast(game, toHand(game, "Fatal Push"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    leaveOne(game);
    cast(game, toHand(game, "Fatal Push"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("can target a creature with mana value 5 or more, and does nothing to it", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    leaveOne(game);
    const titan = spawn(game, "Voidforged Titan", B);
    cast(game, toHand(game, "Fatal Push"), { targets: [ref(titan)] });
    expect(zone(game, titan)).toBe("battlefield");
  });
});

// ------------------------------------------------------------------ the rest

describe("Kutzil's Flanker", () => {
  it("gets a +1/+1 counter for each creature that left the battlefield under your control this turn", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    destroy(game, spawn(game, "Grizzly Bears"));
    destroy(game, spawn(game, "Hill Giant"));
    // Not a creature, and not yours.
    leaveOne(game);
    destroy(game, spawn(game, "Grizzly Bears", B));
    pickModes(a, 0);
    const flanker = toHand(game, "Kutzil's Flanker");
    cast(game, flanker);
    expect(counters(game, flanker)).toBe(2);
    expect(keywords(game, flanker).has("flash")).toBe(true);
  });

  it("exiles target player's graveyard, or gains 2 life and scries 2", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickModes(a, 2);
    pickTargets(a, B);
    cast(game, toHand(game, "Kutzil's Flanker"));
    expect(zone(game, card)).toBe("exile");
    pickModes(a, 1);
    cast(game, toHand(game, "Kutzil's Flanker"));
    expect(life(game, A)).toBe(22);
  });
});

describe("Sarevok, Deathbringer", () => {
  it("at each player's end step, if no permanents left the battlefield this turn, that player loses X life", () => {
    const { game } = table();
    spawn(game, "Sarevok, Deathbringer");
    endStep(game);
    expect(life(game, A)).toBe(17);
    // Bob's turn: a land leaving is a permanent leaving.
    nextTurn(game);
    const [wastes] = lands(game, "Wastes", 1, B);
    destroy(game, wastes);
    game.advanceUntil((s) => s.turn.step === "end");
    settle(game);
    expect(life(game, B)).toBe(20);
    nextTurn(game);
    game.advanceUntil((s) => s.turn.step === "end");
    settle(game);
    // Alice's again — nothing left.
    expect(life(game, A)).toBe(14);
  });

  it("checks again as it resolves (rule 603.4): a permanent leaving in response stops it", () => {
    const { game } = table();
    spawn(game, "Sarevok, Deathbringer");
    game.advanceUntil((s) => s.turn.step === "end" && s.zones.shared.stack.length > 0);
    leaveOne(game, B);
    settle(game);
    expect(life(game, A)).toBe(20);
  });
});

describe("Tale of Momo", () => {
  it("costs {2} less if a creature left the battlefield under your control, and finds an Ally creature card", () => {
    const { game, a } = table();
    const [plains] = lands(game, "Plains", 1);
    const tale = toHand(game, "Tale of Momo");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: tale, targets: [] })).not.toBeNull();
    // A noncreature leaving isn't enough.
    leaveOne(game);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: tale, targets: [] })).not.toBeNull();
    destroy(game, spawn(game, "Grizzly Bears"));
    const ally = toGraveyard(game, "Aang, Air Nomad");
    pickModes(a, 2);
    a.chooseFromZoneFn = (_v, eligible) => eligible.filter((id) => id === ally);
    cast(game, tale);
    expect(game.state.objects[plains].tapped).toBe(true);
    expect(zone(game, ally)).toBe("hand");
  });
});

describe("That's Rough Buddy", () => {
  it("puts one +1/+1 counter, or two if a creature left under your control, and draws", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    cast(game, toHand(game, "That's Rough Buddy"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(hand(game).length).toBe(before + 1);
    destroy(game, spawn(game, "Hill Giant"));
    cast(game, toHand(game, "That's Rough Buddy"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(3);
  });
});

describe("West Wind Avatar", () => {
  it("may sacrifice a token or a land as it enters or attacks, gaining 3 life", () => {
    const { game, a } = table();
    lands(game, "Forest", 7);
    const [extra] = lands(game, "Wastes", 1);
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [extra];
    const avatar = toHand(game, "West Wind Avatar");
    cast(game, avatar);
    expect(zone(game, extra)).toBe("graveyard");
    expect(life(game, A)).toBe(23);
    expect(graveyard(game)).toContain(extra);
    // Sacrificing it was revolt: a card at the end step.
    const before = hand(game).length;
    endStep(game);
    expect(hand(game).length).toBe(before + 1);
  });
});
