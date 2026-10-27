import { describe, expect, it } from "vitest";
import { poolCounts } from "../mana.js";
import {
  A,
  B,
  C,
  activate,
  blockOffer,
  cast,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Mercadian Masques, the rest — group C", () => {
  it("Indentured Djinn lets each other player draw up to three cards, or none", () => {
    const { game, b, c } = table({ players: 3 });
    const handB = hand(game, B).length;
    const handC = hand(game, C).length;
    const handA = hand(game, A).length;
    pickModes(b, 0);
    pickModes(c);
    enter(game, "Indentured Djinn");
    expect(hand(game, B).length).toBe(handB + 3);
    expect(hand(game, C).length).toBe(handC);
    expect(hand(game, A).length).toBe(handA);
  });

  it("Brawl gives every creature a tap ability dealing damage equal to its power", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Brawl"));
    activate(game, giant, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[giant].tapped).toBe(true);
  });

  it("High Seas taxes green creature spells but not blue ones", () => {
    const { game } = table();
    spawn(game, "High Seas", B);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bears, targets: [] })).not.toBeNull();
    lands(game, "Forest", 1);
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Magistrate's Veto stops white and blue creatures blocking", () => {
    const { game, a } = table();
    spawn(game, "Magistrate's Veto");
    const attacker = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions", B);
    const merfolk = spawn(game, "Coral Merfolk", B);
    const giant = spawn(game, "Hill Giant", B);
    const offer = blockOffer(game, a, [attacker]);
    const blockers = offer.eligible.filter((e) => e.canBlock.length > 0).map((e) => e.blocker);
    expect(blockers).toContain(giant);
    expect(blockers).not.toContain(lions);
    expect(blockers).not.toContain(merfolk);
  });

  it("Kyren Toy adds X plus one colorless for X charge counters", () => {
    const { game } = table();
    const toy = spawn(game, "Kyren Toy");
    game.state.objects[toy].counters.charge = 2;
    activate(game, toy, 1, { x: 2, settle: false });
    expect(poolCounts(game.state.players[A].manaPool).C).toBe(3);
    expect(game.state.objects[toy].counters.charge ?? 0).toBe(0);
  });

  it("Silent Assassin destroys the blocking creature at end of combat", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 4);
    const assassin = spawn(game, "Silent Assassin");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    b.declareBlockersFn = () => [{ blocker: giant, attacker: bears }];
    toStep(game, "declare-blockers");
    activate(game, assassin, 0, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    toStep(game, "postcombat-main");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Lava Runner makes the targeting spell's controller sacrifice a land", () => {
    const { game } = table();
    const runner = spawn(game, "Lava Runner");
    lands(game, "Mountain", 2, B);
    game.advanceUntil((s) => s.priority.holder === B);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(runner)] });
    expect(zone(game, runner)).toBe("graveyard");
    expect(named(game, "Mountain", B).length).toBe(1);
    expect(graveyard(game, B).filter((id) => game.state.objects[id].cardName === "Mountain").length).toBe(1);
  });

  it("Warpath hits each blocking and each blocked creature, not an unblocked one", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 4);
    const blocked = spawn(game, "Hill Giant");
    const unblocked = spawn(game, "Hill Giant");
    const blocker = spawn(game, "Hill Giant", B);
    const bystander = spawn(game, "Hill Giant", B);
    a.declareAttackersFn = () => [
      { attacker: blocked, defender: B },
      { attacker: unblocked, defender: B },
    ];
    b.declareBlockersFn = () => [{ blocker, attacker: blocked }];
    toStep(game, "declare-blockers");
    cast(game, toHand(game, "Warpath"));
    expect(zone(game, blocked)).toBe("graveyard");
    expect(zone(game, blocker)).toBe("graveyard");
    expect(zone(game, unblocked)).toBe("battlefield");
    expect(zone(game, bystander)).toBe("battlefield");
  });

  it("Warpath before blocks doesn't hit attackers", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const attacker = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [{ attacker, defender: B }];
    game.advanceUntil(
      (s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.objects[attacker]!.attacking !== null,
    );
    cast(game, toHand(game, "Warpath"));
    expect(game.state.objects[attacker].damageMarked).toBe(0);
  });

  it("Security Detail makes a Soldier only while you control no creatures", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const detail = spawn(game, "Security Detail");
    activate(game, detail);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: detail, abilityIndex: 0, targets: [] }),
    ).not.toBeNull();
  });

  it("Jeweled Torque gains 2 life for {2} when a spell of the chosen colour is cast", () => {
    const { game, a } = table();
    lands(game, "Wastes", 4);
    const torque = toHand(game, "Jeweled Torque");
    game.dispatch({ type: "cast-spell", player: A, card: torque, targets: [] });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-creature-type");
    game.dispatch({ type: "choose-creature-type", player: A, creatureType: "R" });
    settle(game);
    expect(zone(game, torque)).toBe("battlefield");
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    pickTargets(a, B);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, A)).toBe(22);
    expect(life(game, B)).toBe(18);
  });
});
