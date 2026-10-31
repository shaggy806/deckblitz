/**
 * The `prohibit` effect's other forbidden actions and durations: "can't be
 * regenerated this turn" (rule 701.19c — on a target, or on the creatures
 * dealt damage this way), "you can't become the monarch this turn" (rule
 * 725.4's "a player who can become the monarch"), and a target's abilities
 * prohibition "until your next turn" (Dovin Baan's +1). Shipped against
 * Incinerate, Flamebreak, Disintegrate, Jared Carthalion, True Heir and
 * Mythos of Vadrok (detain's effect, word for word).
 */
import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  attack,
  cast,
  counters,
  enter,
  destroy,
  lands,
  life,
  nextTurn,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";

const apply = (game: Game, by: PlayerId, effect: EffectSpec, targets: readonly ObjectId[] = []): void => {
  game.debugApplyEffect(by, effect, targets.map(ref));
  settle(game);
};
const shield = (game: Game, id: ObjectId): void => apply(game, B, { kind: "regenerate", target: 0 }, [id]);

describe("can't be regenerated this turn", () => {
  it("Incinerate: the creature it dealt damage to dies through its regeneration shield", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bear = spawn(game, "Grizzly Bears", B);
    shield(game, bear);
    cast(game, toHand(game, "Incinerate"), { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("graveyard");
  });

  it("a shield works as usual without it (the control)", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    shield(game, bear);
    destroy(game, bear, A);
    expect(zone(game, bear)).toBe("battlefield");
    expect(game.state.objects[bear].tapped).toBe(true);
  });

  it("Incinerate: damage prevented was never dealt, so the creature can still regenerate", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const courser = spawn(game, "Centaur Courser", B);
    apply(game, B, { kind: "prevent-damage", target: 0, amount: 3 }, [courser]);
    cast(game, toHand(game, "Incinerate"), { targets: [ref(courser)] });
    expect(game.state.objects[courser].cantBeRegeneratedTurn).toBeUndefined();
    shield(game, courser);
    destroy(game, courser, A);
    expect(zone(game, courser)).toBe("battlefield");
  });

  it("Incinerate at a player marks nothing", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Incinerate"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });

  it("Flamebreak: every creature dealt damage this way, and only those, can't be regenerated", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const wurm = spawn(game, "Craw Wurm", B);
    const drake = spawn(game, "Wind Drake", B);
    shield(game, wurm);
    shield(game, drake);
    cast(game, toHand(game, "Flamebreak"));
    expect(game.state.objects[wurm].damageMarked).toBe(3);
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
    // The wurm survived the 3 damage but can't be regenerated now.
    destroy(game, wurm, A);
    expect(zone(game, wurm)).toBe("graveyard");
    // The flyer wasn't dealt damage: its shield still works.
    destroy(game, drake, A);
    expect(zone(game, drake)).toBe("battlefield");
  });

  it("Disintegrate: a creature can't be regenerated and is exiled if it dies, damage dealt or not", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bear = spawn(game, "Grizzly Bears", B);
    shield(game, bear);
    cast(game, toHand(game, "Disintegrate"), { targets: [ref(bear)], x: 2 });
    expect(zone(game, bear)).toBe("exile");
  });

  it("Disintegrate: the shield stays unused, and the prohibition ends with the turn", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const wurm = spawn(game, "Craw Wurm", B);
    shield(game, wurm);
    cast(game, toHand(game, "Disintegrate"), { targets: [ref(wurm)], x: 1 });
    expect(game.state.objects[wurm].regenerationShields).toBe(1);
    nextTurn(game);
    shield(game, wurm);
    destroy(game, wurm, A);
    expect(zone(game, wurm)).toBe("battlefield");
  });

  it("the target form on a token in a stack marks just that token", () => {
    const { game } = table();
    const stack = spawn(game, "Wolf Token", B);
    game.state.objects[stack].isToken = true;
    game.state.objects[stack].stackCount = 2;
    apply(game, A, { kind: "prohibit", target: 0, regeneration: true }, [stack]);
    const marked = game.state.zones.shared.battlefield.filter(
      (id) => game.state.objects[id].cantBeRegeneratedTurn === game.state.turn.number,
    );
    expect(marked).toHaveLength(1);
    expect(game.state.objects[marked[0]].stackCount ?? 1).toBe(1);
  });
});

describe("you can't become the monarch this turn", () => {
  it("Jared: target opponent becomes the monarch, and you can't take it back this turn", () => {
    const { game, a } = table({ players: 3 });
    a.chooseTargetsFn = () => [ref(B)];
    enter(game, "Jared Carthalion, True Heir");
    expect(game.state.monarch).toBe(B);
    apply(game, A, { kind: "become-monarch" });
    expect(game.state.monarch).toBe(B);
    // Next turn the "can't" is over.
    nextTurn(game);
    apply(game, A, { kind: "become-monarch" });
    expect(game.state.monarch).toBe(A);
  });

  it("combat damage to the monarch doesn't make you the monarch that turn", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    a.chooseTargetsFn = () => [ref(B)];
    enter(game, "Jared Carthalion, True Heir");
    attack(game, a, [bear]);
    expect(life(game, B)).toBe(18);
    expect(game.state.monarch).toBe(B);
  });

  it("a monarch leaving passes it to the next player who can become the monarch (rule 725.4)", () => {
    const { game } = table({ players: 3 });
    apply(game, A, { kind: "become-monarch", who: "each-opponent" });
    const monarch = game.state.monarch!;
    apply(game, A, { kind: "prohibit", who: "you", monarch: true });
    game.concede(monarch);
    settle(game);
    // Alice is active but can't; the next player still in the game can.
    const other = monarch === B ? C : B;
    expect(game.state.monarch).toBe(other);
  });

  it("Jared's damage becomes +1/+1 counters only while you're the monarch", () => {
    const { game } = table();
    const jared = spawn(game, "Jared Carthalion, True Heir");
    apply(game, B, { kind: "damage", amount: 2, target: 0 }, [jared]);
    expect(game.state.objects[jared].damageMarked).toBe(2);
    expect(counters(game, jared)).toBe(0);
    apply(game, A, { kind: "become-monarch" });
    apply(game, B, { kind: "damage", amount: 2, target: 0 }, [jared]);
    expect(game.state.objects[jared].damageMarked).toBe(2);
    expect(counters(game, jared)).toBe(2);
  });

  it("damage that can't be prevented is dealt, and still puts that many counters on Jared (rule 615.12)", () => {
    const { game } = table();
    const jared = spawn(game, "Jared Carthalion, True Heir");
    apply(game, A, { kind: "become-monarch" });
    apply(game, B, { kind: "damage", amount: 2, target: 0, cantBePrevented: true }, [jared]);
    expect(game.state.objects[jared].damageMarked).toBe(2);
    expect(counters(game, jared)).toBe(2);
    expect(zone(game, jared)).toBe("battlefield");
  });
});

describe("a target's abilities prohibited until your next turn", () => {
  const canActivate = (game: Game, source: ObjectId, player: PlayerId): boolean =>
    game.canDispatch({ type: "activate-ability", player, source, abilityIndex: 0, targets: [ref(A)] }) === null;

  it("lasts through the opponent's turn and ends as the imposer's next turn begins", () => {
    const { game } = table();
    const sorcerer = spawn(game, "Prodigal Sorcerer", B);
    apply(game, A, { kind: "prohibit", target: 0, abilities: true, duration: "until-your-next-turn" }, [sorcerer]);
    nextTurn(game);
    expect(game.state.turn.number).toBe(2);
    expect(canActivate(game, sorcerer, B)).toBe(false);
    nextTurn(game);
    expect(game.state.objects[sorcerer].modifiers.some((m) => m.abilitiesCantBeActivated === true)).toBe(false);
  });

  it("this turn only, by default", () => {
    const { game } = table();
    const sorcerer = spawn(game, "Prodigal Sorcerer", B);
    apply(game, A, { kind: "prohibit", target: 0, abilities: true }, [sorcerer]);
    expect(canActivate(game, sorcerer, B)).toBe(false);
    nextTurn(game);
    expect(canActivate(game, sorcerer, B)).toBe(true);
  });
});

describe("Mythos of Vadrok", () => {
  const detained = (game: Game, id: ObjectId): boolean =>
    game.state.objects[id].modifiers.some(
      (m) => m.abilitiesCantBeActivated === true && (m.restrictions ?? []).includes("cant-attack"),
    );
  const castMythos = (game: Game, paidWith: readonly string[], targets: readonly ObjectId[], division: readonly number[]) => {
    for (const land of paidWith) spawn(game, land);
    cast(game, toHand(game, "Mythos of Vadrok"), { targets: targets.map(ref), division });
  };

  it("with {W}{U} spent: each target is detained until your next turn, after its divided damage", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    const other = spawn(game, "Craw Wurm", B);
    castMythos(game, ["Mountain", "Mountain", "Plains", "Island"], [wurm, other], [2, 3]);
    expect(game.state.objects[wurm].damageMarked).toBe(2);
    expect(game.state.objects[other].damageMarked).toBe(3);
    expect(detained(game, wurm)).toBe(true);
    expect(detained(game, other)).toBe(true);
    // Through bob's turn, gone at alice's next.
    nextTurn(game);
    expect(detained(game, wurm)).toBe(true);
    nextTurn(game);
    expect(detained(game, wurm)).toBe(false);
  });

  it("without {W}{U} spent: only the damage", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    castMythos(game, ["Mountain", "Mountain", "Mountain", "Mountain"], [wurm], [5]);
    expect(zone(game, wurm)).toBe("graveyard");
    const survivor = spawn(game, "Craw Wurm", B);
    const another = spawn(game, "Craw Wurm", B);
    castMythos(game, ["Mountain", "Mountain", "Mountain", "Plains"], [survivor, another], [1, 4]);
    expect(zone(game, another)).toBe("graveyard");
    expect(game.state.objects[survivor].damageMarked).toBe(1);
    expect(detained(game, survivor)).toBe(false);
  });
});
